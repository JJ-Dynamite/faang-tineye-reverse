use axum::{
    routing::{get, post},
    Router,
    Json,
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
    version: String,
}

#[derive(Serialize)]
struct ApiResponse<T: Serialize> {
    success: bool,
    data: Option<T>,
    error: Option<String>,
}

#[derive(Serialize)]
struct ReverseImageResult {
    query_image_url: String,
    total_matches: u32,
    matches: Vec<ImageMatch>,
    search_time_ms: u32,
}

#[derive(Serialize)]
struct ImageMatch {
    id: String,
    source_url: String,
    source_name: String,
    thumbnail_url: String,
    similarity: f32,
    image_size: String,
    page_title: String,
}

#[derive(Deserialize)]
struct SearchRequest {
    image_url: String,
}

async fn health_check() -> impl IntoResponse {
    Json(HealthResponse {
        status: "healthy".to_string(),
        service: "Reverse image search".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

async fn root() -> impl IntoResponse {
    Json(ApiResponse::<()> {
        success: true,
        data: None,
        error: None,
    })
}

async fn search_image(Json(req): Json<SearchRequest>) -> impl IntoResponse {
    let result = ReverseImageResult {
        query_image_url: req.image_url.clone(),
        total_matches: 234,
        matches: vec![
            ImageMatch {
                id: "1".to_string(),
                source_url: "https://example.com/image1.jpg".to_string(),
                source_name: "Flickr".to_string(),
                thumbnail_url: "https://thumb.example.com/1.jpg".to_string(),
                similarity: 98.5,
                image_size: "1920x1080".to_string(),
                page_title: "Beautiful Landscape Photo".to_string(),
            },
            ImageMatch {
                id: "2".to_string(),
                source_url: "https://example.com/image2.jpg".to_string(),
                source_name: "Unsplash".to_string(),
                thumbnail_url: "https://thumb.example.com/2.jpg".to_string(),
                similarity: 87.2,
                image_size: "2560x1440".to_string(),
                page_title: "Nature Photography".to_string(),
            },
        ],
        search_time_ms: 342,
    };

    Json(ApiResponse {
        success: true,
        data: Some(result),
        error: None,
    })
}

async fn get_popular_searches() -> impl IntoResponse {
    let searches = vec![
        serde_json::json!({ "type": "celebrity", "count": 23456 }),
        serde_json::json!({ "type": "artwork", "count": 12345 }),
        serde_json::json!({ "type": "product", "count": 34567 }),
    ];

    Json(ApiResponse {
        success: true,
        data: Some(searches),
        error: None,
    })
}

async fn get_stats() -> impl IntoResponse {
    Json(ApiResponse {
        success: true,
        data: Some(serde_json::json!({
            "total_searches": 5678901,
            "images_indexed": 1234567890,
            "avg_search_time_ms": 450,
            "accuracy_rate": 94.5
        })),
        error: None,
    })
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health_check))
        .route("/api/search", post(search_image))
        .route("/api/popular", get(get_popular_searches))
        .route("/api/stats", get(get_stats))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .unwrap();

    tracing::info!("Reverse image search backend running on port 3001");
    axum::serve(listener, app).await.unwrap();
}
