provider "aws" {
  region = "us-east-1"
}

resource "random_id" "suffix" {
  byte_length = 2
}

locals {
  fqdn         = var.subdomain != "" ? "${var.subdomain}.${var.domain_name}" : var.domain_name
  bucket_name  = "taskvision-${var.environment}-frontend-${random_id.suffix.hex}"
  oac_name     = "frontend-oac-${var.environment}"
}

module "acm" {
  source      = "./modules/acm"
  domain_name = local.fqdn
  san_list    = []
  zone_id     = var.route53_zone_id
  environment = var.environment
}
