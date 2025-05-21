output "s3_bucket_name" {
  description = "Name of the S3 bucket used for frontend deployment"
  value       = local.bucket_id
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = local.create_cf ? aws_cloudfront_distribution.frontend[0].id : var.cloudfront_distribution_id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = local.cloudfront_domain_name
}

output "certificate_arn" {
  description = "ARN of the ACM certificate used for HTTPS"
  value       = module.acm.certificate_arn
}