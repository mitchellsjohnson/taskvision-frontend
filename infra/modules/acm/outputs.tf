output "certificate_arn" {
  value = local.certificate_arn
}

output "validation_record_fqdns" {
  value = data.aws_acm_certificate.existing.arn == null ? [for record in aws_route53_record.cert_validation : record.fqdn] : []
}