<?php
/**
 * Plugin Name: TROO Storefront Auth
 * Description: Login/register REST endpoints for the TROO Bio-Labs headless storefront. The storefront's server (not the browser) calls these and manages its own session cookie.
 * Version: 1.0.0
 */

defined( 'ABSPATH' ) || exit;

add_action( 'rest_api_init', function () {
	register_rest_route( 'troo/v1', '/login', [
		'methods'             => 'POST',
		'permission_callback' => '__return_true',
		'callback'            => function ( WP_REST_Request $req ) {
			$login    = sanitize_text_field( $req->get_param( 'login' ) );
			$password = (string) $req->get_param( 'password' );
			if ( ! $login || ! $password ) {
				return new WP_Error( 'troo_missing', 'Email and password are required.', [ 'status' => 400 ] );
			}
			$user = wp_authenticate( $login, $password );
			if ( is_wp_error( $user ) ) {
				return new WP_Error( 'troo_invalid', 'Invalid email or password.', [ 'status' => 401 ] );
			}
			return [
				'id'         => $user->ID,
				'email'      => $user->user_email,
				'first_name' => get_user_meta( $user->ID, 'first_name', true ),
				'last_name'  => get_user_meta( $user->ID, 'last_name', true ),
			];
		},
	] );

	register_rest_route( 'troo/v1', '/register', [
		'methods'             => 'POST',
		'permission_callback' => '__return_true',
		'callback'            => function ( WP_REST_Request $req ) {
			$email      = sanitize_email( $req->get_param( 'email' ) );
			$password   = (string) $req->get_param( 'password' );
			$first_name = sanitize_text_field( $req->get_param( 'first_name' ) );
			$last_name  = sanitize_text_field( $req->get_param( 'last_name' ) );

			if ( ! is_email( $email ) ) {
				return new WP_Error( 'troo_email', 'A valid email address is required.', [ 'status' => 400 ] );
			}
			if ( strlen( $password ) < 8 ) {
				return new WP_Error( 'troo_password', 'Password must be at least 8 characters.', [ 'status' => 400 ] );
			}
			if ( email_exists( $email ) ) {
				return new WP_Error( 'troo_exists', 'An account with this email already exists.', [ 'status' => 409 ] );
			}

			$user_id = wp_insert_user( [
				'user_login' => $email,
				'user_email' => $email,
				'user_pass'  => $password,
				'first_name' => $first_name,
				'last_name'  => $last_name,
				'role'       => 'customer',
			] );
			if ( is_wp_error( $user_id ) ) {
				return new WP_Error( 'troo_register', $user_id->get_error_message(), [ 'status' => 400 ] );
			}
			return [
				'id'         => $user_id,
				'email'      => $email,
				'first_name' => $first_name,
				'last_name'  => $last_name,
			];
		},
	] );
} );
