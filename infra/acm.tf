module "acm" {
  source      = "./modules/acm"
  domain_name = var.domain_name
  san_list    = ["dev.${var.domain_name}"]  # Include dev subdomain as SAN
  zone_id     = var.route53_zone_id
} 