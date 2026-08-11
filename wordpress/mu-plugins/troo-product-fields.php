<?php
/**
 * Plugin Name: TROO Product Fields
 * Description: Registers the scientific product fields (ACF) used by the TROO Bio-Labs headless storefront. Field names match the REST meta keys the storefront reads.
 * Version: 1.0.0
 */

defined( 'ABSPATH' ) || exit;

add_action( 'acf/init', function () {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	$text     = fn( $key, $name, $label, $extra = [] ) => array_merge(
		[ 'key' => "field_troo_{$key}", 'name' => $name, 'label' => $label, 'type' => 'text' ],
		$extra
	);
	$wysiwyg  = fn( $key, $name, $label, $extra = [] ) => array_merge(
		[
			'key'          => "field_troo_{$key}",
			'name'         => $name,
			'label'        => $label,
			'type'         => 'wysiwyg',
			'tabs'         => 'all',
			'toolbar'      => 'basic',
			'media_upload' => 0,
		],
		$extra
	);
	$tab      = fn( $key, $label ) => [ 'key' => "field_troo_tab_{$key}", 'label' => $label, 'type' => 'tab' ];

	acf_add_local_field_group(
		[
			'key'      => 'group_troo_product_fields',
			'title'    => 'TROO Product Data (storefront)',
			'location' => [ [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'product' ] ] ],
			'position' => 'normal',
			'style'    => 'default',
			'fields'   => [
				$tab( 'general', 'General' ),
				$text( 'sub_title', 'sub_title', 'Subtitle', [ 'instructions' => 'Short compound subtitle shown under the product name, e.g. "BPC-157 + TB-500".' ] ),
				$text( 'vendor', 'vendor', 'Vendor / Brand', [ 'placeholder' => 'Troo Bio-Labs' ] ),
				[
					'key'           => 'field_troo_popular',
					'name'          => 'popular',
					'label'         => 'Popular badge',
					'type'          => 'true_false',
					'ui'            => 1,
					'instructions'  => 'Shows the orange "Popular" badge on the shop grid. (The pink "Featured" badge uses the standard WooCommerce Featured toggle.)',
				],
				$text( 'display_rating', 'display_rating', 'Display rating', [ 'instructions' => 'Star rating shown on the storefront (e.g. 4.8). Used until real product reviews exist.' ] ),
				$text( 'display_reviews', 'display_reviews', 'Display review count', [ 'instructions' => 'Review count shown next to the rating.' ] ),

				$tab( 'descriptions', 'Descriptions' ),
				/* Plain-English long description = the standard WooCommerce "Description" editor. */
				$wysiwyg( 'long_sci', 'long_description_scientific', 'Long Description — Scientific' ),
				$wysiwyg( 'moa_plain', 'mechanism_of_action_plain', 'Mechanism of Action — Plain English' ),
				$wysiwyg( 'moa_sci', 'mechanism_of_action_scientific', 'Mechanism of Action — Scientific' ),
				[
					'key'          => 'field_troo_additional_notes',
					'name'         => 'additional_notes',
					'label'        => 'Additional Notes',
					'type'         => 'textarea',
					'rows'         => 4,
					'instructions' => 'Optional extra notes shown in their own accordion on the product page.',
				],

				$tab( 'research', 'Research' ),
				[
					'key'          => 'field_troo_applications',
					'name'         => 'research_applications',
					'label'        => 'Research Applications',
					'type'         => 'textarea',
					'rows'         => 5,
					'instructions' => 'One application per line (bullets are added automatically on the site).',
				],
				$wysiwyg( 'studies', 'research_studies', 'Research Studies' ),
				$wysiwyg( 'references', 'references', 'References' ),

				$tab( 'specs', 'Scientific Specs' ),
				$text( 'alt_names', 'alternate_names_synonyms', 'Alternate Names / Synonyms' ),
				$text( 'cas', 'cas_number', 'CAS Number' ),
				$text( 'form', 'form', 'Form', [ 'placeholder' => 'Lyophilized Powder' ] ),
				$text( 'formula', 'molecular_formula', 'Molecular Formula' ),
				$text( 'mw', 'molecular_weight_mw', 'Molecular Weight (MW)' ),
				$text( 'purity', 'purity', 'Purity', [ 'placeholder' => '≥99%' ] ),
				$text( 'sequence', 'sequence', 'Sequence' ),
				$text( 'storage', 'storage_conditions', 'Storage Conditions', [ 'placeholder' => '-20°C, protected from light and moisture' ] ),

				$tab( 'seo', 'SEO' ),
				$text( 'seo_title', 'seo_title', 'SEO Title', [ 'instructions' => 'Browser-tab / search-result title. Falls back to the product name.' ] ),
				[
					'key'          => 'field_troo_seo_description',
					'name'         => 'seo_description',
					'label'        => 'SEO Description',
					'type'         => 'textarea',
					'rows'         => 3,
					'instructions' => 'Meta description for search results. Falls back to the short description.',
				],

				$tab( 'coa', 'Lab Report (COA)' ),
				$text( 'coa_label', 'coa_label', 'COA Lot Label', [ 'instructions' => 'Lot number shown on the site, e.g. AARLL-3548854-P.' ] ),
				[
					'key'           => 'field_troo_coa_file',
					'name'          => 'coa_file',
					'label'         => 'COA PDF URL',
					'type'          => 'url',
					'instructions'  => 'Upload the PDF to the Media Library, then paste its file URL here.',
				],
			],
		]
	);
} );

/* Expose the plain meta keys in the wp/v2 REST responses too (wc/v3 already returns meta_data). */
add_action( 'init', function () {
	$keys = [
		'sub_title', 'vendor', 'popular', 'display_rating', 'display_reviews',
		'long_description_scientific', 'additional_notes', 'seo_title', 'seo_description',
		'mechanism_of_action_plain', 'mechanism_of_action_scientific',
		'research_applications', 'research_studies', 'references',
		'alternate_names_synonyms', 'cas_number', 'form', 'molecular_formula',
		'molecular_weight_mw', 'purity', 'sequence', 'storage_conditions',
		'coa_label', 'coa_file',
	];
	foreach ( $keys as $key ) {
		register_post_meta( 'product', $key, [ 'show_in_rest' => true, 'single' => true, 'type' => 'string' ] );
	}
} );
