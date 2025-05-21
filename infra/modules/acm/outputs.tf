output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = local.certificate_arn
}

output "validation_record_fqdns" {
  description = "DNS records needed to validate ACM certificate (if any)"
  value       = []
}
