const awsmobile = {
    "aws_project_region": "us-east-1",
    "aws_cognito_identity_pool_id": "",
    "aws_cognito_region": "us-east-1",
    "aws_user_pools_id": "us-east-1_k6Yq4imqY",
    "aws_user_pools_web_client_id": "77p5abnso665b0vlfnlp2t8gg1",
    "oauth": {
        "domain": "https://us-east-1ixcqgsnxm.auth.us-east-1.amazoncognito.com",
        "scope": [
            "phone",
            "email",
            "openid",
            "profile",
            "aws.cognito.signin.user.admin"
        ],
        // **IMPORTANTE**: Asegúrate de que estas URLs coincidan con las configuradas en Cognito App Client y Capacitor/Cordova
        "redirectSignIn": "http://localhost:8100/tabs/tab1", // Añade tus URLs de redirección de Ionic/Capacitor/Cordova aquí
        //"redirectSignOut": "http://localhost:8100/login/,com.yourapp.id://oauthredirect", // Añade tus URLs de redirección de Ionic/Capacitor/Cordova aquí
        "responseType": "code" // O "token"

    },
    "federationTarget": "COGNITO_USER_POOLS",

    "aws_cognito_username_attributes": [
        "EMAIL"
    ],
    "aws_cognito_social_providers": [],
    "aws_cognito_signup_attributes": [
        "EMAIL"
    ],
    "aws_cognito_mfa_configuration": "OFF",
    "aws_cognito_mfa_types": [],
    "aws_cognito_password_protection_settings": {
        "passwordPolicyMinLength": 8,
        "passwordPolicyCharacters": []
    },
    "aws_cognito_verification_mechanisms": [
        "EMAIL"
    ],
    "aws_user_files_s3_bucket": "aversillueve-usuarios", // El nombre de tu bucket
    "aws_user_files_s3_bucket_region": "us-east-1" // La región de tu bucket
};

export default awsmobile;
