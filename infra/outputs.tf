output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = module.acm.certificate_arn
}

output "validation_record_fqdns" {
  description = "DNS records needed to validate ACM certificate (if any)"
  value       = module.acm.validation_record_fqdns
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = var.s3_bucket_name != "" ? local.bucket_id : ""
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = var.cloudfront_distribution_id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = var.cloudfront_distribution_id != "" ? local.cloudfront_domain_name : ""
}

output "route53_record_name" {
  description = "DNS record created for the frontend domain"
  value       = var.cloudfront_distribution_id != "" ? aws_route53_record.frontend_alias[0].name : ""
}