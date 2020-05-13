// env vars required in CIRCLECI:
// AWS_ACCESS_KEY_ID
// AWS_SECRET_ACCESS_KEY
// HEROKU_API_KEY
// HEROKU_EMAIL
// REACT_APP_BACKEND_BASE_URL
// REACT_APP_FRONTEND_BASE_URL
// TF_VAR_aws_region
// TF_VAR_backend_domain
// TF_VAR_cert_domain
// TF_VAR_environment
// TF_VAR_frontend_domain
// TF_VAR_root_domain


variable "aws_region" {}

variable "root_domain" {}
variable "cert_domain" {}
variable "backend_domain" {}

terraform {
  backend "s3" {
    bucket         = "changeme-terraform"
    key            = "changeme.tfstate"
    region         = "eu-central-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}

provider "heroku" {}

provider "aws" {
  region = var.aws_region
}

resource "heroku_app" "backend" {
  name   = "changeme-backend-${terraform.workspace}"
  region = "eu"
  acm    = "true"

  //  config_vars = {
  //    FOOBAR = "baz"
  //

  buildpacks = [
    "heroku/nodejs"
  ]
}

resource "heroku_addon" "database" {
  app  = heroku_app.backend.name
  plan = "postgres:sandbox"
}

// Can't use Terraform for this because we want to share the same add-on across all environments
//resource "heroku_addon" "logging" {
//  app  = heroku_app.backend.name
//  plan = "papertrail:choklad"
//}

resource "heroku_domain" "backend" {
  app      = heroku_app.backend.name
  hostname = var.backend_domain
}


// For CloudFront, the SSL certificate must be in us-east-1
provider "aws" {
  alias = "acm"
  region = "us-east-1"
}
//data "aws_acm_certificate" "ssl_cert" {
//  provider = aws.acm
//  domain   = var.cert_domain
//  statuses = ["ISSUED"]
//}
//
//resource "aws_cloudfront_distribution" "backend_cloudfront_distribution" {
//  origin {
//    custom_origin_config {
//      http_port              = "80"
//      https_port             = "443"
//      origin_protocol_policy = "http-only"
//      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
//    }
//    domain_name = heroku_domain.backend.cname
//    origin_id   = heroku_domain.backend.cname
//  }
//
//  enabled             = true
//  default_root_object = "index.html"
//
//  default_cache_behavior {
//    viewer_protocol_policy = "redirect-to-https"
//    compress               = true
//    allowed_methods        = ["GET", "HEAD"]
//    cached_methods         = ["GET", "HEAD"]
//    target_origin_id       = heroku_domain.backend.cname
//    min_ttl                = 0
//    default_ttl            = 86400
//    max_ttl                = 31536000
//
//    forwarded_values {
//      query_string = false
//      cookies {
//        forward = "none"
//      }
//    }
//  }
//
//  custom_error_response {
//    error_caching_min_ttl = 3000
//    error_code            = 404
//    response_code         = 200
//    response_page_path    = "/index.html"
//  }
//
//  aliases = [var.backend_domain]
//
//  restrictions {
//    geo_restriction {
//      restriction_type = "none"
//    }
//  }
//
//  viewer_certificate {
//    acm_certificate_arn = data.aws_acm_certificate.ssl_cert.arn
//    ssl_support_method  = "sni-only"
//  }
//}

data "aws_route53_zone" "zone" {
  name         = var.root_domain
  private_zone = false
}

resource "aws_route53_record" "backend_record" {
  zone_id = data.aws_route53_zone.zone.zone_id
  name    = var.backend_domain
  type    = "CNAME"
  records = [heroku_domain.backend.cname]
  ttl     = 60

  //  alias {
  //    name = aws_cloudfront_distribution.backend_cloudfront_distribution.domain_name
  //    zone_id = aws_cloudfront_distribution.backend_cloudfront_distribution.hosted_zone_id
  //    evaluate_target_health = false
  //  }
}
