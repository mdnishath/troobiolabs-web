<?php
/**
 * Plugin Name: TROO Zelle Gateway
 * Description: Zelle payments for the TROO Bio-Labs storefront. The storefront shows the receiving details and a payment reference, then collects the sender and a screenshot before the order is created. Configure under WooCommerce → Settings → Payments → Zelle.
 * Version: 1.1.0
 * Author: TROO Bio-Labs
 *
 * Kept separate from TROO Core on purpose: a payment gateway is the client's to
 * enable, disable or replace without touching the storefront's plumbing.
 *
 * Replaces the third-party "Checkout with Zelle" plugin. It deliberately keeps
 * that plugin's option keys (woocommerce_zelle_settings / ReceiverZelle*) so the
 * receiving details the client already configured carry over untouched — no
 * migration step, nothing for them to re-enter.
 *
 * 1.1.0 — the headless storefront creates orders through the REST API, which
 * never runs process_payment(). It now POSTs the sender + screenshot to
 * /troo/v1/zelle/proof right after creating the order (authenticated with a
 * one-time token it stored in order meta). That endpoint records the same
 * meta process_payment() would, moves the order to Processing, and the admin
 * order screen gets a "Zelle Payment Proof" box.
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'plugins_loaded',
	function () {
		if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
			return;
		}

		/* stand aside while the third-party plugin still owns the "zelle" id */
		if ( class_exists( 'WC_Zelle_Gateway' ) || class_exists( 'TROO_Zelle_Gateway' ) ) {
			return;
		}

		class TROO_Zelle_Gateway extends WC_Payment_Gateway {

			public function __construct() {
				$this->id                 = 'zelle';
				$this->method_title       = 'Zelle';
				$this->method_description = 'Bank-to-bank Zelle transfer. The storefront collects the sender details and a payment screenshot before the order is created.';
				$this->has_fields         = false;

				$this->init_form_fields();
				$this->init_settings();

				$this->title       = $this->get_option( 'checkout_title', 'Zelle' );
				$this->description = $this->get_option( 'checkout_description', '' );

				add_action(
					'woocommerce_update_options_payment_gateways_' . $this->id,
					array( $this, 'process_admin_options' )
				);
			}

			public function init_form_fields() {
				$this->form_fields = array(
					'enabled'              => array(
						'title'   => 'Enable/Disable',
						'type'    => 'checkbox',
						'label'   => 'Enable Zelle',
						'default' => 'no',
					),
					'checkout_title'       => array(
						'title'       => 'Title',
						'type'        => 'text',
						'description' => 'Shown to the customer at checkout.',
						'default'     => 'Zelle',
						'desc_tip'    => true,
					),
					'checkout_description' => array(
						'title'    => 'Description',
						'type'     => 'textarea',
						'default'  => '',
						'desc_tip' => true,
					),
					'ReceiverZelleOwner'   => array(
						'title'       => 'Zelle name',
						'type'        => 'text',
						'description' => 'The account name customers will see when sending payment.',
						'default'     => '',
						'desc_tip'    => true,
					),
					'ReceiverZELLEEmail'   => array(
						'title'       => 'Zelle email',
						'type'        => 'text',
						'description' => 'The email that receives payments. Double-check it — customers send money here.',
						'default'     => '',
						'desc_tip'    => true,
					),
					'ReceiverZELLENo'      => array(
						'title'       => 'Zelle phone',
						'type'        => 'text',
						'default'     => '',
						'desc_tip'    => true,
					),
					'enableQRCode'         => array(
						'title'   => 'QR code',
						'type'    => 'checkbox',
						'label'   => 'Show a QR code on the payment page',
						'default' => 'no',
					),
					'ZelleQRCode'          => array(
						'title'       => 'QR code image URL',
						'type'        => 'text',
						'description' => 'Upload the image in Media, then paste its URL here.',
						'default'     => '',
						'desc_tip'    => true,
					),
				);
			}

			/**
			 * The storefront has already collected the sender details and proof
			 * by this point; record them, take the stock and mark the order paid
			 * for fulfilment purposes (the transfer is verified out of band).
			 */
			public function process_payment( $order_id ) {
				$order = wc_get_order( $order_id );

				if ( ! $order ) {
					return array( 'result' => 'failure' );
				}

				$sender    = isset( $_POST['zelle_sender'] ) ? sanitize_text_field( wp_unslash( $_POST['zelle_sender'] ) ) : '';
				$reference = isset( $_POST['zelle_reference'] ) ? sanitize_text_field( wp_unslash( $_POST['zelle_reference'] ) ) : '';
				$proof_id  = isset( $_POST['zelle_proof_id'] ) ? absint( $_POST['zelle_proof_id'] ) : 0;

				if ( $sender ) {
					$order->update_meta_data( 'zelle_sender', $sender );
				}
				if ( $reference ) {
					$order->update_meta_data( 'zelle_reference', $reference );
				}
				if ( $proof_id ) {
					$order->update_meta_data( 'zelle_proof_id', $proof_id );
					$order->update_meta_data( 'zelle_proof_url', wp_get_attachment_url( $proof_id ) );
				}
				$order->save();

				wc_reduce_stock_levels( $order_id );

				$note = 'Zelle payment submitted. Reference: ' . ( $reference ? $reference : 'n/a' ) .
					'. Sender: ' . ( $sender ? $sender : 'n/a' ) . '.';
				if ( $proof_id ) {
					$note .= ' Proof: ' . wp_get_attachment_url( $proof_id );
				}
				$order->add_order_note( $note );

				$order->update_status( 'processing', 'Zelle proof received; awaiting manual confirmation of funds. ' );

				return array( 'result' => 'success' );
			}
		}
	}
);

add_filter(
	'woocommerce_payment_gateways',
	function ( $gateways ) {
		if ( class_exists( 'TROO_Zelle_Gateway' ) ) {
			$gateways[] = 'TROO_Zelle_Gateway';
		}
		return $gateways;
	}
);

/**
 * Receiving details for the storefront's payment page. The customer has to see
 * these to pay at all, but the storefront server fetches them, not the browser.
 */
add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'troo/v1',
			'/zelle/details',
			array(
				'methods'             => 'GET',
				'permission_callback' => function () {
					return current_user_can( 'manage_woocommerce' );
				},
				'callback'            => function () {
					$s = (array) get_option( 'woocommerce_zelle_settings', array() );
					$g = function ( $k ) use ( $s ) {
						return isset( $s[ $k ] ) ? trim( (string) $s[ $k ] ) : '';
					};

					return array(
						'enabled' => 'yes' === $g( 'enabled' ),
						'title'   => $g( 'checkout_title' ) ? $g( 'checkout_title' ) : 'Zelle',
						'name'    => $g( 'ReceiverZelleOwner' ),
						'email'   => $g( 'ReceiverZELLEEmail' ),
						'phone'   => $g( 'ReceiverZELLENo' ),
						'qr'      => 'yes' === $g( 'enableQRCode' ) ? $g( 'ZelleQRCode' ) : '',
					);
				},
			)
		);
	}
);

/* ---------------------------------------------------------------------
 * Storefront proof upload: POST /wp-json/troo/v1/zelle/proof
 *
 * The storefront server creates the order via wc/v3 with a random
 * `_troo_zelle_token` meta, then calls this with that token plus the
 * sender name, optional confirmation number and a data: URL screenshot.
 * The token is single-use. Until proof arrives the order stays Pending.
 * ------------------------------------------------------------------- */
const TROO_ZELLE_TOKEN_META = '_troo_zelle_token';
const TROO_ZELLE_MAX_BYTES  = 4 * 1024 * 1024;

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'troo/v1',
			'/zelle/proof',
			array(
				'methods'             => 'POST',
				'permission_callback' => '__return_true', // token-verified below
				'callback'            => 'troo_zelle_store_proof',
			)
		);
	}
);

function troo_zelle_store_proof( WP_REST_Request $req ) {
	if ( ! function_exists( 'wc_get_order' ) ) {
		return new WP_Error( 'troo_no_wc', 'WooCommerce is not active.', array( 'status' => 500 ) );
	}

	$order_id  = absint( $req->get_param( 'order_id' ) );
	$token     = (string) $req->get_param( 'token' );
	$sender    = sanitize_text_field( $req->get_param( 'sender' ) );
	$reference = sanitize_text_field( $req->get_param( 'reference' ) );
	$shot      = (string) $req->get_param( 'screenshot' );

	$order = $order_id ? wc_get_order( $order_id ) : null;
	if ( ! $order ) {
		return new WP_Error( 'troo_order', 'Order not found.', array( 'status' => 404 ) );
	}

	$expected = (string) $order->get_meta( TROO_ZELLE_TOKEN_META, true );
	if ( '' === $expected || '' === $token || ! hash_equals( $expected, $token ) ) {
		return new WP_Error( 'troo_token', 'Invalid proof token.', array( 'status' => 403 ) );
	}
	if ( '' === $sender ) {
		return new WP_Error( 'troo_sender', 'Sender name is required.', array( 'status' => 400 ) );
	}
	if ( strlen( $shot ) > TROO_ZELLE_MAX_BYTES ) {
		return new WP_Error( 'troo_size', 'Screenshot is too large.', array( 'status' => 413 ) );
	}
	if ( ! preg_match( '#^data:image/(png|jpe?g|webp|gif);base64,(.+)$#s', $shot, $m ) ) {
		return new WP_Error( 'troo_image', 'Screenshot must be a PNG, JPEG, WebP or GIF image.', array( 'status' => 400 ) );
	}
	$bytes = base64_decode( $m[2], true );
	if ( false === $bytes || '' === $bytes ) {
		return new WP_Error( 'troo_image', 'Screenshot could not be decoded.', array( 'status' => 400 ) );
	}

	$ext      = 'jpeg' === $m[1] ? 'jpg' : $m[1];
	$filename = sprintf( 'zelle-proof-order-%d-%s.%s', $order_id, wp_generate_password( 6, false ), $ext );
	$upload   = wp_upload_bits( $filename, null, $bytes );
	if ( ! empty( $upload['error'] ) ) {
		return new WP_Error( 'troo_upload', $upload['error'], array( 'status' => 500 ) );
	}

	require_once ABSPATH . 'wp-admin/includes/image.php';
	$proof_id = wp_insert_attachment(
		array(
			'post_mime_type' => $upload['type'],
			'post_title'     => sprintf( 'Zelle payment proof - order #%d', $order_id ),
			'post_content'   => '',
			'post_status'    => 'private',
		),
		$upload['file']
	);
	if ( is_wp_error( $proof_id ) ) {
		return new WP_Error( 'troo_attach', $proof_id->get_error_message(), array( 'status' => 500 ) );
	}
	wp_update_attachment_metadata( $proof_id, wp_generate_attachment_metadata( $proof_id, $upload['file'] ) );

	/* same meta process_payment() writes, so both paths look identical in admin */
	$order->update_meta_data( 'zelle_sender', $sender );
	if ( $reference ) {
		$order->update_meta_data( 'zelle_reference', $reference );
	}
	$order->update_meta_data( 'zelle_proof_id', $proof_id );
	$order->update_meta_data( 'zelle_proof_url', wp_get_attachment_url( $proof_id ) );
	$order->delete_meta_data( TROO_ZELLE_TOKEN_META );
	$order->save();

	$order->add_order_note(
		'Zelle payment submitted. Reference: ' . ( $reference ? $reference : 'n/a' ) .
		'. Sender: ' . $sender . '. Proof: ' . wp_get_attachment_url( $proof_id )
	);
	$order->update_status( 'processing', 'Zelle proof received; awaiting manual confirmation of funds. ' );

	return array(
		'ok'       => true,
		'order_id' => $order_id,
		'proof_id' => $proof_id,
	);
}

/* ---------------------------------------------------------------------
 * Admin: "Zelle Payment Proof" box on the order edit screen
 * (legacy post storage and HPOS order tables)
 * ------------------------------------------------------------------- */
add_action(
	'add_meta_boxes',
	function () {
		$screen = function_exists( 'wc_get_page_screen_id' ) ? wc_get_page_screen_id( 'shop-order' ) : 'shop_order';
		add_meta_box( 'troo-zelle-proof', 'Zelle Payment Proof', 'troo_zelle_proof_metabox', $screen, 'side', 'high' );
	}
);

function troo_zelle_proof_metabox( $post_or_order ) {
	$order = $post_or_order instanceof WC_Order ? $post_or_order : wc_get_order( $post_or_order->ID );
	if ( ! $order ) {
		return;
	}
	$is_zelle = 'zelle' === $order->get_payment_method() || false !== stripos( (string) $order->get_payment_method_title(), 'zelle' );
	$sender   = $order->get_meta( 'zelle_sender', true );
	$ref      = $order->get_meta( 'zelle_reference', true );
	$proof_id = (int) $order->get_meta( 'zelle_proof_id', true );
	$url      = $proof_id ? wp_get_attachment_url( $proof_id ) : $order->get_meta( 'zelle_proof_url', true );

	if ( ! $is_zelle && ! $sender && ! $url ) {
		echo '<p style="color:#7a8694;margin:0">Not a Zelle order.</p>';
		return;
	}
	if ( ! $sender && ! $url ) {
		echo '<p style="color:#b02a70;font-weight:600;margin:0">No payment proof received. The customer did not complete the Zelle step - do not ship.</p>';
		return;
	}

	echo '<p style="margin:0 0 6px"><strong>Sender:</strong> ' . esc_html( $sender ) . '</p>';
	if ( $ref ) {
		echo '<p style="margin:0 0 6px"><strong>Confirmation #:</strong> ' . esc_html( $ref ) . '</p>';
	}
	if ( $url ) {
		echo '<a href="' . esc_url( $url ) . '" target="_blank" rel="noopener">';
		if ( $proof_id ) {
			echo wp_get_attachment_image( $proof_id, 'medium', false, array( 'style' => 'max-width:100%;height:auto;border:1px solid #dce3ea;border-radius:6px' ) );
		} else {
			echo '<img src="' . esc_url( $url ) . '" alt="Zelle proof" style="max-width:100%;height:auto;border:1px solid #dce3ea;border-radius:6px" />';
		}
		echo '</a>';
		echo '<p style="margin:8px 0 0"><a class="button" href="' . esc_url( $url ) . '" target="_blank" rel="noopener">Open full-size screenshot</a></p>';
	}
	echo '<p style="color:#7a8694;font-size:12px;margin:8px 0 0">Verify the transfer in your bank, then mark the order Completed when it ships.</p>';
}
