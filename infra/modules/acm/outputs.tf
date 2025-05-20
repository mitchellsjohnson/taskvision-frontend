output "certificate_arn" {
  description = "ARN of the ACM certificate (either created or reused)"
  value = length(data.aws_acm_certificate.existing) > 0 ? data.aws_acm_certificate.existing[0].arn : aws_acm_certificate.cert[0].arn
}

output "validation_record_fqdns" {
  description = "The DNS records to add to validate the certificate"
  value = length(data.aws_acm_certificate.existing) == 0 ? [for record in aws_route53_record.cert_validation : record.fqdn] : []
}