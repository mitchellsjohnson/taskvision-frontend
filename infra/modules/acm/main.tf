### TaskVision ACM Module (START)

resource "aws_acm_certificate" "cert" {
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
  validation_records = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = local.validation_records

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.zone_id

  lifecycle {
    ignore_changes = [
      name,
      records,
      ttl,
      type
    ]
  }
}

resource "aws_acm_certificate_validation" "cert_validation" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

### TaskVision ACM Module (END)
