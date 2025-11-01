/**
 * Gemini AI Service
 * Integration with Google's Gemini Pro API for AI-powered features
 */

import { ENV_CONFIG } from '../config/environment.js';

class GeminiService {
    constructor() {
        this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
        this.model = 'gemini-pro';
        
        // API key check - features disabled if not configured
    }

    /**
     * Test Gemini API connection
     */
    async testConnection() {
        try {
            const response = await this.generateContent('Hello, this is a test message.');
            return {
                success: true,
                message: 'Gemini API is working correctly',
                response: response
            };
        } catch (error) {
            return {
                success: false,
                message: 'Gemini API test failed',
                error: error.message
            };
        }
    }

    /**
     * Generate content using Gemini Pro
     */
    async generateContent(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('Gemini API key not configured');
        }

        try {
            const requestBody = {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: options.temperature || 0.7,
                    topK: options.topK || 40,
                    topP: options.topP || 0.95,
                    maxOutputTokens: options.maxTokens || 1024,
                }
            };

            const response = await fetch(`${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response from Gemini API');
            }

        } catch (error) {
            throw error;
        }
    }

    /**
     * Analyze lead quality and provide recommendations
     */
    async analyzeLeadQuality(leadData) {
        try {
            const prompt = `
            Analyze this real estate lead data and provide quality assessment:
            
            Lead Information:
            - Name: ${leadData.name || 'Not provided'}
            - Phone: ${leadData.phone || 'Not provided'}
            - Email: ${leadData.email || 'Not provided'}
            - Requirement: ${leadData.requirement || 'Not specified'}
            - Location: ${leadData.location || 'Not specified'}
            - Budget: ${leadData.budget || 'Not specified'}
            - Source: ${leadData.source || 'Unknown'}
            - Notes: ${leadData.notes || 'No notes'}
            
            Please provide:
            1. Quality Score (1-10)
            2. Priority Level (High/Medium/Low)
            3. Recommended Next Action
            4. Risk Factors
            5. Opportunity Assessment
            6. Follow-up Suggestions
            
            Respond in JSON format:
            {
                "qualityScore": 8,
                "priority": "High",
                "recommendedAction": "Call immediately",
                "riskFactors": ["No phone number"],
                "opportunityAssessment": "Strong intent, ready to buy",
                "followUpSuggestions": "Send property recommendations"
            }
            `;

            const response = await this.generateContent(prompt);
            
            try {
                const analysis = JSON.parse(response);
                return {
                    success: true,
                    analysis: analysis
                };
            } catch (parseError) {
                // If JSON parsing fails, return raw response
                return {
                    success: true,
                    analysis: {
                        qualityScore: 5,
                        priority: "Medium",
                        recommendedAction: "Follow up via email",
                        riskFactors: ["Unable to parse AI response"],
                        opportunityAssessment: response,
                        followUpSuggestions: "Manual review required"
                    }
                };
            }

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate personalized email content
     */
    async generateEmailContent(leadData, emailType = 'followup') {
        try {
            const prompt = `
            Generate a personalized email for this real estate lead:
            
            Lead Details:
            - Name: ${leadData.name || 'Valued Client'}
            - Requirement: ${leadData.requirement || 'Property'}
            - Location: ${leadData.location || 'your preferred area'}
            - Budget: ${leadData.budget || 'your budget'}
            
            Email Type: ${emailType}
            
            Create a professional, personalized email that:
            1. Is warm and friendly
            2. Addresses their specific needs
            3. Includes relevant property suggestions
            4. Has a clear call-to-action
            5. Maintains professional tone
            
            Keep it concise (under 200 words) and include placeholders for:
            - Agent name
            - Company name
            - Contact details
            - Property links
            `;

            const response = await this.generateContent(prompt);
            
            return {
                success: true,
                content: response,
                subject: this.generateEmailSubject(leadData, emailType)
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate email subject line
     */
    generateEmailSubject(leadData, emailType) {
        const subjects = {
            'followup': `Property Update for ${leadData.name || 'You'} - ${leadData.location || 'Your Area'}`,
            'welcome': `Welcome ${leadData.name || 'Client'} - Your Property Search Starts Here`,
            'property_match': `Perfect Match Found - ${leadData.requirement || 'Your Requirements'}`,
            'reminder': `Following Up - ${leadData.requirement || 'Your Property Search'}`,
            'closing': `Let's Close the Deal - ${leadData.location || 'Your Dream Property'}`
        };

        return subjects[emailType] || subjects['followup'];
    }

    /**
     * Analyze conversation sentiment
     */
    async analyzeSentiment(text) {
        try {
            const prompt = `
            Analyze the sentiment of this conversation text:
            
            "${text}"
            
            Determine:
            1. Overall sentiment (Positive/Negative/Neutral)
            2. Confidence level (0-1)
            3. Key emotions detected
            4. Urgency level (High/Medium/Low)
            5. Customer satisfaction (1-10)
            
            Respond in JSON format:
            {
                "sentiment": "Positive",
                "confidence": 0.85,
                "emotions": ["interested", "excited"],
                "urgency": "Medium",
                "satisfaction": 8
            }
            `;

            const response = await this.generateContent(prompt);
            
            try {
                const sentiment = JSON.parse(response);
                return {
                    success: true,
                    sentiment: sentiment
                };
            } catch (parseError) {
                return {
                    success: true,
                    sentiment: {
                        sentiment: "Neutral",
                        confidence: 0.5,
                        emotions: ["neutral"],
                        urgency: "Low",
                        satisfaction: 5
                    }
                };
            }

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate property recommendations
     */
    async generatePropertyRecommendations(leadData, availableProperties) {
        try {
            const propertiesText = availableProperties.map(prop => 
                `- ${prop.name || 'Property'}: ${prop.type || 'Type'} in ${prop.location || 'Location'}, ₹${prop.price || 'Price'}`
            ).join('\n');

            const prompt = `
            Based on this lead's requirements and available properties, provide recommendations:
            
            Lead Requirements:
            - Requirement: ${leadData.requirement || 'Not specified'}
            - Location: ${leadData.location || 'Not specified'}
            - Budget: ${leadData.budget || 'Not specified'}
            - Timeline: ${leadData.timeline || 'Not specified'}
            
            Available Properties:
            ${propertiesText}
            
            Provide:
            1. Top 3 property recommendations with reasons
            2. Alternative options if budget doesn't match
            3. Suggested viewing schedule
            4. Negotiation tips
            5. Next steps
            
            Be specific and actionable in your recommendations.
            `;

            const response = await this.generateContent(prompt);
            
            return {
                success: true,
                recommendations: response
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate follow-up reminders
     */
    async generateFollowUpReminders(leads) {
        try {
            const leadsText = leads.map(lead => 
                `- ${lead.name || 'Lead'}: ${lead.requirement || 'Requirement'} in ${lead.location || 'Location'}, Last contact: ${lead.lastContactDate || 'Never'}`
            ).join('\n');

            const prompt = `
            Generate follow-up reminders for these leads:
            
            ${leadsText}
            
            Provide:
            1. Priority order for follow-ups
            2. Suggested contact method for each
            3. Personalized message templates
            4. Timing recommendations
            5. Escalation triggers
            
            Focus on leads that haven't been contacted recently or show high potential.
            `;

            const response = await this.generateContent(prompt);
            
            return {
                success: true,
                reminders: response
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate market insights
     */
    async generateMarketInsights(location, propertyType) {
        try {
            const prompt = `
            Generate real estate market insights for:
            - Location: ${location}
            - Property Type: ${propertyType}
            
            Provide:
            1. Current market trends
            2. Price analysis
            3. Demand indicators
            4. Investment opportunities
            5. Risk factors
            6. Future outlook
            
            Base insights on general market knowledge and provide actionable advice for real estate agents.
            `;

            const response = await this.generateContent(prompt);
            
            return {
                success: true,
                insights: response
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Create singleton instance
const geminiService = new GeminiService();

export default geminiService;
export { GeminiService };
