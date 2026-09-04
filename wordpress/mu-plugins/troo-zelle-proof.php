<?php
/**
 * Plugin Name: TROO Zelle Payment Proof
 * Description: Receives the Zelle sender details + payment screenshot the headless storefront collects at checkout, stores them on the WooCommerce order, and shows them on the admin order screen. Orders paid by Zelle stay "On hold" until staff verify the transfer and mark them Processing.
 * Version: 1.0.0
 */

defined( 'ABSPATH' ) || exit;

const TROO_ZELLE_TOKEN_META   = '_troo_proof_token';
const TROO_ZELLE_SENDER_META  = '_troo_zelle_sender';
const TROO_ZELLE_REF_META     = '_troo_zelle_reference';
const TROO_ZELLE_PROOF_META   = '_troo_zelle_proof_id';
const TROO_ZELLE_MAX_BYTES    = 4 * 1024 * 1024;

/* ---------------------------------------------------------------------
 * REST: POST /wp-json/troo/v1/zelle-proof
 * The storefront server calls this right after creating the order. The
 * one-time token it wrote into order meta is the credential.
 * ------------------------------------------------------------------- */
add_action( 'rest_api_init', function () {
	register_rest_route( 'troo/v1', '/zelle-proof', [
		'methods'             => 'POST',
		'permission_callback' => '__return_true',
		'callback'            => 'troo_zelle_proof_handler',
	] );
} );

function troo_zelle_proof_handler( WP_REST_Request $req ) {
	if ( ! function_exists( 'wc_get_order' ) ) {
		return new WP_Error( 'troo_no_wc', 'WooCommerce is not active.', [ 'status' => 500 ] );
	}

	$order_id = absint( $req->get_param( 'order_id' ) );
	$token    = (string) $req->get_param( 'token' );
	$sender   = sanitize_text_field( $req->get_param( 'sender_name' ) );
	$ref      = sanitize_text_field( $req->get_param( 'reference' ) );
	$shot     = (string) $req->get_param( 'screenshot' );

	$order = $order_id ? wc_get_order( $order_id ) : null;
	if ( ! $order ) {
		return new WP_Error( 'troo_order', 'Order not found.', [ 'status' => 404 ] );
	}

	$expected = (string) $order->get_meta( TROO_ZELLE_TOKEN_META, true );
	if ( '' === $expected || '' === $token || ! hash_equals( $expected, $token ) ) {
		return new WP_Error( 'troo_token', 'Invalid proof token.', [ 'status' => 403 ] );
	}
	if ( '' === $sender ) {
		return new WP_Error( 'troo_sender', 'Sender name is required.', [ 'status' => 400 ] );
	}
	if ( strlen( $shot ) > TROO_ZELLE_MAX_BYTES ) {
		return new WP_Error( 'troo_size', 'Screenshot is too large.', [ 'status' => 413 ] );
	}
	if ( ! preg_match( '#^data:image/(png|jpe?g|webp|gif);base64,(.+)$#s', $shot, $m ) ) {
		return new WP_Error( 'troo_image', 'Screenshot must be a PNG, JPEG, WebP or GIF image.', [ 'status' => 400 ] );
	}

	$ext   = 'jpeg' === $m[1] ? 'jpg' : $m[1];
	$bytes = base64_decode( $m[2], true );
	if ( false === $bytes || '' === $bytes ) {
		return new WP_Error( 'troo_image', 'Screenshot could not be decoded.', [ 'status' => 400 ] );
	}

	/* write the file into the uploads dir, then register it as an attachment */
	$filename = sprintf( 'zelle-proof-order-%d-%s.%s', $order_id, wp_generate_password( 6, false ), $ext );
	$upload   = wp_upload_bits( $filename, null, $bytes );
	if ( ! empty( $upload['error'] ) ) {
		return new WP_Error( 'troo_upload', $upload['error'], [ 'status' => 500 ] );
	}

	require_once ABSPATH . 'wp-admin/includes/image.php';
	$attachment_id = wp_insert_attachment( [
		'post_mime_type' => $upload['type'],
		'post_title'     => sprintf( 'Zelle payment proof – order #%d', $order_id ),
		'post_content'   => '',
		'post_status'    => 'private',
	], $upload['file'] );
	if ( is_wp_error( $attachment_id ) ) {
		return new WP_Error( 'troo_attach', $attachment_id->get_error_message(), [ 'status' => 500 ] );
	}
	wp_update_attachment_metadata( $attachment_id, wp_generate_attachment_metadata( $attachment_id, $upload['file'] ) );

	/* pin everything to the order; the token is single-use */
	$order->update_meta_data( TROO_ZELLE_SENDER_META, $sender );
	$order->update_meta_data( TROO_ZELLE_REF_META, $ref );
	$order->update_meta_data( TROO_ZELLE_PROOF_META, $attachment_id );
	$order->delete_meta_data( TROO_ZELLE_TOKEN_META );
	if ( 'on-hold' !== $order->get_status() ) {
		$order->set_status( 'on-hold' );
	}
	$order->save();

	$order->add_order_note( sprintf(
		"Zelle payment proof submitted by customer.\nSender: %s%s\nScreenshot: %s\n\nVerify the transfer, then change the order status to Processing.",
		$sender,
		'' !== $ref ? "\nZelle confirmation #: {$ref}" : '',
		wp_get_attachment_url( $attachment_id )
	) );

	return [
		'ok'            => true,
		'order_id'      => $order_id,
		'attachment_id' => $attachment_id,
	];
}

/* ---------------------------------------------------------------------
 * Admin: "Zelle Payment Proof" box on the order edit screen
 * (works with both legacy post storage and HPOS order tables)
 * ------------------------------------------------------------------- */
add_action( 'add_meta_boxes', function () {
	$screen = function_exists( 'wc_get_page_screen_id' ) ? wc_get_page_screen_id( 'shop-order' ) : 'shop_order';
	add_meta_box(
		'troo-zelle-proof',
		'Zelle Payment Proof',
		'troo_zelle_proof_metabox',
		$screen,
		'side',
		'high'
	);
} );

function troo_zelle_proof_metabox( $post_or_order ) {
	$order = $post_or_order instanceof WC_Order ? $post_or_order : wc_get_order( $post_or_order->ID );
	if ( ! $order ) {
		return;
	}
	$sender = $order->get_meta( TROO_ZELLE_SENDER_META, true );
	$ref    = $order->get_meta( TROO_ZELLE_REF_META, true );
	$img_id = (int) $order->get_meta( TROO_ZELLE_PROOF_META, true );

	if ( ! $sender && ! $img_id ) {
		if ( false !== stripos( $order->get_payment_method(), 'zelle' ) || false !== stripos( $order->get_payment_method_title(), 'zelle' ) ) {
			echo '<p style="color:#b02a70;font-weight:600">No payment proof was received for this Zelle order.</p>';
		} else {
			echo '<p style="color:#7a8694">Not a Zelle order.</p>';
		}
		return;
	}

	echo '<p><strong>Sender:</strong> ' . esc_html( $sender ) . '</p>';
	if ( $ref ) {
		echo '<p><strong>Zelle confirmation #:</strong> ' . esc_html( $ref ) . '</p>';
	}
	if ( $img_id ) {
		$url = wp_get_attachment_url( $img_id );
		echo '<a href="' . esc_url( $url ) . '" target="_blank" rel="noopener">';
		echo wp_get_attachment_image( $img_id, 'medium', false, [ 'style' => 'max-width:100%;height:auto;border:1px solid #dce3ea;border-radius:6px' ] );
		echo '</a>';
		echo '<p><a class="button" href="' . esc_url( $url ) . '" target="_blank" rel="noopener">Open full-size screenshot</a></p>';
	}
	if ( 'on-hold' === $order->get_status() ) {
		echo '<p style="color:#7a8694;font-size:12px">Order is on hold. Once the transfer is verified, set the status to <strong>Processing</strong>.</p>';
	}
}
