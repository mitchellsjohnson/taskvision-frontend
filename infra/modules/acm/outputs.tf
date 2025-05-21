output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.frontend[0].bucket
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = var.cloudfront_distribution_id != "" ? var.cloudfront_distribution_id : aws_cloudfront_distribution.frontend[0].id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = var.cloudfront_distribution_id != "" ? "" : aws_cloudfront_distribution.frontend[0].domain_name
}

output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = module.acm.certificate_arn
}
