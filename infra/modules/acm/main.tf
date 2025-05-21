### TaskVision ACM Module (START)

# ACM Certificate
data "aws_acm_certificate" "existing" {
  domain = var.domain_name
  statuses = ["ISSUED"]
  most_recent = true
}

locals {
  certificate_arn = data.aws_acm_certificate.existing.arn
}

resource "aws_route53_record" "cert_validation" {
  count = length(local.validation_options)

  allow_overwrite = true
  name            = local.validation_options[count.index].resource_record_name
  records         = [local.validation_options[count.index].resource_record_value]
  ttl             = 60
  type            = local.validation_options[count.index].resource_record_type
  zone_id         = var.zone_id
}

resource "aws_acm_certificate_validation" "cert_validation" {
  count = length(local.validation_options) > 0 ? 1 : 0

  certificate_arn         = local.certificate_arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

### TaskVision ACM Module (END)
