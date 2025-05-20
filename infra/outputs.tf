output "s3_bucket_name" {
  description = "Name of the S3 bucket hosting the frontend"
  value       = aws_s3_bucket.frontend.bucket
}

output "cloudfront_distribution_id" {
  value = data.aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  value = data.aws_cloudfront_distribution.frontend.domain_name
}

### TaskVision ACM Outputs (START)

output "certificate_arn" {
  value = module.acm.certificate_arn
}

### TaskVision ACM Outputs (END)
