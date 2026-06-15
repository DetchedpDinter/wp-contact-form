<?php

if (!defined('ABSPATH')) {
    exit;
}

function cfp_send_telegram_message($message)
{
    $bot_token = '8847269590:AAGlTLlY5vKKVjbj-GPaQ_nD1BaEnf1WqMM';
    $chat_id = '7875841429';

    $url = "https://api.telegram.org/bot{$bot_token}/sendMessage";

    wp_remote_post($url, [
        'body' => [
            'chat_id' => $chat_id,
            'text' => $message,
        ]
    ]);
}
