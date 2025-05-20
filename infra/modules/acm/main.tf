### TaskVision ACM Module (START)

data "aws_acm_certificate" "existing" {
  domain      = var.domain_name
  statuses    = ["ISSUED"]
  most_recent = true
}

resource "aws_acm_certificate" "cert" {
  count = data.aws_acm_certificate.existing.arn == null ? 1 : 0

  domain_name               = var.domain_name
  validation_method         = "DNS"
  subject_alternative_names = var.san_list

  lifecycle {
    prevent_destroy = true
    ignore_changes = [
      domain_name,
      subject_alternative_names,
      validation_method
    ]
  }

  tags = {
    Environment = var.environment
  }
}

locals {
  certificate_arn = data.aws_acm_certificate.existing.arn != null ? data.aws_acm_certificate.existing.arn : aws_acm_certificate.cert[0].arn
  validation_options = data.aws_acm_certificate.existing.arn == null ? tolist(aws_acm_certificate.cert[0].domain_validation_options) : []
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
  count = data.aws_acm_certificate.existing.arn == null ? 1 : 0

  certificate_arn         = local.certificate_arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

### TaskVision ACM Module (END)
