# Botpress Webchat Customization Guide

This guide explains how to customize the Botpress webchat design for your hospital chatbot project.

## Customization Summary

The Botpress webchat has been customized with the following settings:

### Colors
- **Brand/Primary Color**: `#1E90FF` (Dodger Blue)
- **Secondary Color**: `#00CED1` (Dark Turquoise)
- **Background**: `#F5F5F5` (Light Gray)
- **Bot Message Bubble**: `#E0F7FA` (Light Cyan)
- **User Message Bubble**: `#DCF8C6` (Light Green)
- **Header Text**: `#FFFFFF` (White)

### Fonts
- **Body Font**: Arial, sans-serif
- **Header Font**: Helvetica, sans-serif

### Layout
- **Width**: 350px
- **Height**: 500px
- **Position**: Right side
- **Border Radius**: 12px (rounded corners)

### Header
- **Title**: "My Hospital Bot"
- **Logo**: https://yourdomain.com/logo.png (Update this URL with your actual logo)

## Files Created

1. **`public/botpress-config.json`** - Main configuration file
2. **`public/botpress-custom.css`** - Custom CSS stylesheet
3. **`public/botpress-final-config.json`** - Complete configuration ready for upload
4. **`src/components/BotpressChatbot.jsx`** - Updated React component with custom styling

## How to Apply Customizations

### Option 1: Using URL Parameters (Current Implementation)
The component currently passes configuration via URL parameters. This works but has limitations due to CORS restrictions.

### Option 2: Upload Custom Configuration JSON (Recommended)

1. **Update the logo URL** in `public/botpress-final-config.json`:
   ```json
   "botAvatar": "https://your-actual-domain.com/logo.png",
   "header": {
     "avatar": "https://your-actual-domain.com/logo.png"
   }
   ```

2. **Upload the configuration file** to a publicly accessible location:
   - Option A: Upload to your own server/CDN
   - Option B: Upload to a cloud storage service (AWS S3, Google Cloud Storage, etc.)
   - Option C: Use a file hosting service

3. **Update the BotpressChatbot component** to use your hosted config:
   ```javascript
   const configParams = new URLSearchParams({
     configUrl: 'https://your-server.com/path/to/botpress-final-config.json',
     // ... other params
   })
   ```

### Option 3: Configure in Botpress Dashboard

1. Log into your Botpress Cloud dashboard
2. Navigate to your bot's configuration
3. Go to "Webchat" settings
4. Apply the customization settings from `botpress-final-config.json`
5. Save and publish

## Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the patient dashboard
3. Click "Start Chatting" to open the chatbot
4. Verify the customizations:
   - Colors match your specifications
   - Fonts are correct
   - Layout is 350px × 500px
   - Border radius is applied (12px)
   - Header shows "My Hospital Bot"
   - Message bubbles have correct colors

## Important Notes

1. **Logo URL**: Replace `https://yourdomain.com/logo.png` with your actual logo URL
2. **CORS Restrictions**: Direct iframe styling may be limited due to cross-origin restrictions
3. **Botpress Version**: This configuration is for Botpress Webchat v3.3
4. **Custom Logic**: The chatbot's logic and responses are not modified, only the styling

## Troubleshooting

If customizations don't appear:

1. **Clear browser cache** and reload
2. **Check browser console** for CORS errors
3. **Verify configuration file** is publicly accessible
4. **Check if URL parameters** are being passed correctly
5. **Try using Botpress dashboard** configuration instead

## Next Steps

1. Update the logo URL with your actual hospital logo
2. Test all customization settings
3. Upload the configuration to a hosting service
4. Update the component to use the hosted config URL

