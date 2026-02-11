// Discord Bot API Client for website-to-bot communication
// This file provides functions to call the Discord bot

const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';

export async function syncUserRoles(discordId: string, action: 'add' | 'remove', roleId: string) {
  try {
    const response = await fetch(`${BOT_API_URL}/api/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discordId, action, roleId }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to sync roles:', error);
    return false;
  }
}

export async function sendDiscordNotification(
  discordId: string,
  message: string,
  type: 'approval' | 'rejection' | 'modification' | 'info'
) {
  try {
    const response = await fetch(`${BOT_API_URL}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discordId, message, type }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

export async function sendAdminAlert(applicationId: string, type: 'new' | 'approved' | 'rejected' | 'modification') {
  try {
    const response = await fetch(`${BOT_API_URL}/api/admin-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, type }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to send admin alert:', error);
    return false;
  }
}

export async function logToDiscord(action: string, userId: string, details: string) {
  try {
    const response = await fetch(`${BOT_API_URL}/api/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, userId, details }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to log to Discord:', error);
    return false;
  }
}
