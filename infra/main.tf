provider "aws" {
  region = "us-east-1"
}

locals {
  fqdn = var.subdomain != "" ? "${var.subdomain}.${var.domain_name}" : var.domain_name
}

data "aws_s3_bucket" "frontend" {
  bucket = var.s3_bucket_name
}

data "aws_cloudfront_distribution" "frontend" {
  id = var.cloudfront_distribution_id
}

resource "aws_route53_record" "frontend_alias" {
  zone_id = var.zone_id
  name    = local.fqdn
  type    = "A"

  alias {
    name                   = data.aws_cloudfront_distribution.frontend.domain_name
    zone_id                = data.aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}
