import React, { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMessage, faTimes, faHeadset } from '@fortawesome/free-solid-svg-icons'
import { motion, AnimatePresence } from 'framer-motion'

function BotpressChatbot() {
  const [isMinimized, setIsMinimized] = useState(true)
  const [botpressReady, setBotpressReady] = useState(false)
  const chatContainerRef = useRef(null)
  const botpressInstanceRef = useRef(null)

  // Custom Botpress configuration - Matching Dashboard Theme (Emerald/Cyan)
  const botpressConfig = {
    // Match dashboard theme colors (emerald/cyan)
    primaryColor: '#10B981', // emerald-500 to match dashboard
    secondaryColor: '#06B6D4', // cyan-500 to match dashboard
    backgroundColor: '#ECFDF5', // emerald-50 to match dashboard background
    textColorOnPrimaryColor: '#FFFFFF',
    // Bot message bubble - light cyan/emerald
    botMessageColor: '#D1FAE5', // emerald-100 - matches dashboard theme
    // User message bubble - light green
    userMessageColor: '#DCF8C6', // Keep light green for contrast
    fontFamily: 'Arial, sans-serif',
    headerFontFamily: 'Helvetica, sans-serif',
    botName: 'Hospital Assistant',
    botAvatar: 'https://yourdomain.com/logo.png',
    headerTitle: 'Hospital Assistant',
    headerLogo: 'https://yourdomain.com/logo.png',
    width: '100%',
    height: '500px',
    borderRadius: '12px',
    configUrl: 'https://files.bpcontent.cloud/2025/11/01/15/20251101153120-P9ED71BM.json',
    configScriptUrl: 'https://files.bpcontent.cloud/2025/11/01/15/20251101153120-QQAH912P.js'
  }

  const toggleChat = () => {
    setIsMinimized(false)
    // Show Botpress webchat when chat is opened
    if (window.botpressWebChat && botpressInstanceRef.current) {
      botpressInstanceRef.current.sendEvent({ type: 'show' })
    }
  }

  const minimizeChat = () => {
    setIsMinimized(true)
    // Hide Botpress webchat when chat is minimized
    if (window.botpressWebChat && botpressInstanceRef.current) {
      botpressInstanceRef.current.sendEvent({ type: 'hide' })
    }
  }

  // Initialize Botpress SDK
  useEffect(() => {
    // Load Botpress inject.js script
    const loadBotpressSDK = () => {
      if (window.botpressWebChat) {
        initializeBotpress()
        return
      }

      // Load inject.js
      const injectScript = document.createElement('script')
      injectScript.src = 'https://cdn.botpress.cloud/webchat/v3.3/inject.js'
      injectScript.async = true
      injectScript.onload = () => {
        // Load configuration script
        const configScript = document.createElement('script')
        configScript.src = botpressConfig.configScriptUrl
        configScript.defer = true
        configScript.onload = () => {
          initializeBotpress()
        }
        document.body.appendChild(configScript)
      }
      document.head.appendChild(injectScript)
    }

    // Initialize Botpress with custom theme
    const initializeBotpress = () => {
      if (!window.botpressWebChat) return

      try {
        // Wait for container to be available
        if (!chatContainerRef.current) {
          setTimeout(initializeBotpress, 100)
          return
        }

        // The config script should already initialize the webchat
        // We'll customize it after initialization
        if (window.botpressWebChat && window.botpressWebChat.init) {
          // Check if already initialized
          const existingWidget = chatContainerRef.current.querySelector('[class*="bp-widget"]')
          if (existingWidget) {
            botpressInstanceRef.current = window.botpressWebChat
            setBotpressReady(true)
            applyThemeStyles()
            return
          }

          // Initialize with custom container if possible
          try {
            const customConfig = {
              container: chatContainerRef.current,
              hideWidget: true,
              theme: {
                primaryColor: botpressConfig.primaryColor,
                secondaryColor: botpressConfig.secondaryColor,
                backgroundColor: botpressConfig.backgroundColor,
                fontFamily: botpressConfig.fontFamily
              },
              ...(window.botpressWebChat.config || {})
            }
            
            botpressInstanceRef.current = window.botpressWebChat.init(customConfig)
          } catch (e) {
            // Config script might auto-initialize, just use that
            botpressInstanceRef.current = window.botpressWebChat
          }
          
          setBotpressReady(true)
          applyThemeStyles()
        }
      } catch (error) {
        console.error('Error initializing Botpress:', error)
        // Fallback: try again after a delay
        setTimeout(() => {
          if (!botpressReady) {
            initializeBotpress()
          }
        }, 500)
      }
    }

    // Apply theme styles after Botpress loads
    const applyThemeStyles = () => {
      setTimeout(() => {
        const container = chatContainerRef.current
        if (container) {
          // Apply custom CSS variables for theme
          container.style.setProperty('--primary-color', botpressConfig.primaryColor)
          container.style.setProperty('--secondary-color', botpressConfig.secondaryColor)
          container.style.setProperty('--background-color', botpressConfig.backgroundColor)
        }
      }, 500)
    }

    loadBotpressSDK()

    // Cleanup
    return () => {
      if (botpressInstanceRef.current) {
        try {
          botpressInstanceRef.current.sendEvent({ type: 'hide' })
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }, [botpressReady])

  // Inject custom CSS for Botpress webchat
  useEffect(() => {
    // Inject custom CSS when iframe loads
    const injectCustomStyles = () => {
      const customStyle = document.createElement('style')
      customStyle.id = 'botpress-custom-styles'
      customStyle.textContent = `
        /* Botpress Custom Styles - Matching Dashboard Theme (Emerald/Cyan) */
        iframe[title="Botpress Chatbot"] {
          border-radius: 0 0 12px 12px !important;
          background: transparent !important;
        }
        
        /* Inject styles into iframe when available */
        .bp-widget-container {
          background: linear-gradient(to bottom, #ECFDF5, #FFFFFF) !important;
          width: 100% !important;
          height: 500px !important;
          border-radius: 12px !important;
          font-family: Arial, sans-serif !important;
        }
        
        .bp-widget-header {
          font-family: Helvetica, sans-serif !important;
          background: linear-gradient(to right, #10B981, #06B6D4) !important;
          color: #FFFFFF !important;
          border-radius: 12px 12px 0 0 !important;
        }
        
        .bp-message-bot {
          background-color: #D1FAE5 !important;
          border-radius: 12px !important;
          font-family: Arial, sans-serif !important;
          color: #065F46 !important;
        }
        
        .bp-message-user {
          background-color: #DCF8C6 !important;
          border-radius: 12px !important;
          font-family: Arial, sans-serif !important;
          color: #166534 !important;
        }
        
        .bp-composer {
          background-color: #ECFDF5 !important;
          border-radius: 0 0 12px 12px !important;
          border-top: 1px solid rgba(16, 185, 129, 0.2) !important;
        }
        
        .bp-button {
          background: linear-gradient(to right, #10B981, #06B6D4) !important;
          border-radius: 12px !important;
        }
        
        .bp-button:hover {
          background: linear-gradient(to right, #059669, #0891B2) !important;
        }
        
        /* Match dashboard scrollbar style */
        .bp-widget-body::-webkit-scrollbar {
          width: 8px !important;
        }
        
        .bp-widget-body::-webkit-scrollbar-track {
          background: #ECFDF5 !important;
        }
        
        .bp-widget-body::-webkit-scrollbar-thumb {
          background: #10B981 !important;
          border-radius: 4px !important;
        }
      `
      
      if (!document.getElementById('botpress-custom-styles')) {
        document.head.appendChild(customStyle)
      }
    }

    injectCustomStyles()

    // Style the Botpress webchat container when it's injected
    const styleBotpressContainer = () => {
      // Apply styles to Botpress container elements
      const applyStyles = () => {
        const container = chatContainerRef.current
        if (container) {
          // Style the main Botpress container
          const botpressWidget = container.querySelector('.bp-widget-container') || 
                                 container.querySelector('[class*="bp-widget"]') ||
                                 container.querySelector('[id*="botpress"]')
          
          if (botpressWidget) {
            botpressWidget.style.borderRadius = '12px'
            botpressWidget.style.overflow = 'hidden'
            botpressWidget.style.fontFamily = botpressConfig.fontFamily
          }
        }
      }

      // Try to apply styles immediately and after a delay
      applyStyles()
      setTimeout(applyStyles, 100)
      setTimeout(applyStyles, 500)
      setTimeout(applyStyles, 1000)
    }

    styleBotpressContainer()

    return () => {
      const style = document.getElementById('botpress-custom-styles')
      if (style) {
        style.remove()
      }
    }
  }, [botpressReady])

  // Handle messages from Botpress iframe (optional)
  useEffect(() => {
    const handleMessage = (event) => {
      // Handle messages from Botpress iframe if needed
      if (event.origin === 'https://cdn.botpress.cloud') {
        // Process messages from Botpress
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <div className="relative">
      {/* Chat Widget Container - Matching Dashboard Theme */}
      <div className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all overflow-hidden" style={{ fontFamily: botpressConfig.fontFamily }}>
        {isMinimized ? (
          // Minimized/Collapsed View
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 cursor-pointer"
            onClick={toggleChat}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 p-2 shadow-lg">
                  <FontAwesomeIcon icon={faHeadset} className="text-white text-sm" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2" style={{ fontFamily: botpressConfig.headerFontFamily }}>
                    <FontAwesomeIcon icon={faMessage} className="text-emerald-600 text-sm" />
                    Chat with us
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Get instant help from our AI assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-cyan-50 to-teal-50 border border-emerald-100 shadow-sm">
              <p className="text-sm font-medium text-gray-700">
                👋 Hi! I'm here to help you with appointments, prescriptions, and general inquiries.
              </p>
              <button className="mt-3 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all">
                Start Chatting →
              </button>
            </div>
          </motion.div>
        ) : (
          // Expanded/Open View
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {/* Chat Header - Matching Dashboard Theme */}
            <div 
              className="flex items-center justify-between p-4 text-white rounded-t-2xl"
              style={{ 
                background: `linear-gradient(to right, ${botpressConfig.primaryColor}, ${botpressConfig.secondaryColor})`,
                fontFamily: botpressConfig.headerFontFamily
              }}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-1.5 backdrop-blur-sm">
                  {botpressConfig.headerLogo && botpressConfig.headerLogo !== 'https://yourdomain.com/logo.png' ? (
                    <img 
                      src={botpressConfig.headerLogo} 
                      alt="Bot Logo" 
                      className="rounded-full w-6 h-6"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <FontAwesomeIcon icon={faHeadset} className="text-white text-sm" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ fontFamily: botpressConfig.headerFontFamily }}>
                    {botpressConfig.headerTitle}
                  </h3>
                  <p className="text-xs text-white/90">Online • Ready to help</p>
                </div>
              </div>
              <button
                onClick={minimizeChat}
                className="rounded-full bg-white/20 hover:bg-white/30 p-2 transition-all backdrop-blur-sm"
                aria-label="Minimize chat"
              >
                <FontAwesomeIcon icon={faTimes} className="text-white" />
              </button>
            </div>

            {/* Botpress Chat Container - SDK Embedded */}
            <div 
              ref={chatContainerRef}
              className="relative overflow-hidden rounded-b-2xl" 
              style={{ 
                height: botpressConfig.height, 
                width: botpressConfig.width,
                maxWidth: '100%',
                margin: '0 auto',
                background: `linear-gradient(to bottom, ${botpressConfig.backgroundColor}, #FFFFFF)`,
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              {/* Botpress WebChat will be injected here by the SDK */}
              
              {/* Loading Overlay */}
              {!botpressReady && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2"></div>
                    <p className="text-sm text-gray-600">Loading chatbot...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Footer Info - Matching Dashboard Theme */}
            <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-t border-emerald-100 p-3 rounded-b-2xl">
              <p className="text-xs text-center text-gray-600">
                Powered by Botpress • Secure and private
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Chat Button (Alternative - can be enabled if preferred) */}
      {/* Uncomment below if you want a floating button instead */}
      {/*
      <AnimatePresence>
        {isMinimized && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-50 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white p-4 shadow-2xl hover:shadow-3xl transition-all hover:scale-110"
            aria-label="Open chat"
          >
            <FontAwesomeIcon icon={faMessage} className="text-xl" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-600"></span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
      */}
    </div>
  )
}

export default BotpressChatbot

