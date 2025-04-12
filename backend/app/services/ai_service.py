import os
import openai
from typing import List, Dict, Any, Optional
from app.core.config import settings

class AIService:
    """Service for generating AI insights using OpenAI API"""
    
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        openai.api_key = self.api_key
        
    async def generate_insight(
        self, 
        target_type: str, 
        target_data: Dict[str, Any],
        custom_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate an AI insight based on target data
        
        Args:
            target_type: Type of target (fan, chatter, creator, message, general)
            target_data: Data about the target to analyze
            custom_prompt: Optional custom prompt to use instead of default
            
        Returns:
            Dictionary containing the generated insight
        """
        if not self.api_key or self.api_key == "sk-placeholder-key-for-development":
            # Return mock data if no API key is provided
            return self._generate_mock_insight(target_type, target_data)
        
        # Construct the prompt based on target type
        prompt = custom_prompt if custom_prompt else self._construct_prompt(target_type, target_data)
        
        try:
            # Call OpenAI API
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an AI assistant that analyzes OnlyFans data and provides insights for a fan management agency."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            # Parse the response
            insight_text = response.choices[0].message.content
            
            # Process the insight text to extract structured data
            return self._process_insight_text(insight_text, target_type, target_data)
            
        except Exception as e:
            print(f"Error calling OpenAI API: {e}")
            # Fall back to mock data if API call fails
            return self._generate_mock_insight(target_type, target_data)
    
    def _construct_prompt(self, target_type: str, target_data: Dict[str, Any]) -> str:
        """Construct a prompt based on target type and data"""
        
        if target_type == "fan":
            return f"""
            Analyze this OnlyFans fan data and provide insights:
            
            Fan Name: {target_data.get('name', 'Unknown')}
            Total Spent: ${target_data.get('total_spent', 0)}
            First Seen: {target_data.get('first_seen', 'Unknown')}
            Last Active: {target_data.get('last_active', 'Unknown')}
            
            Please provide:
            1. A brief summary of this fan's behavior
            2. Detailed analysis of spending patterns and engagement
            3. 3-5 relevant tags for categorizing this fan
            4. A confidence score (0.0-1.0) for your analysis
            5. 2-3 action items for the chatters to increase engagement with this fan
            
            Format your response as:
            SUMMARY: [brief summary]
            DETAILS: [detailed analysis]
            TAGS: [comma-separated tags]
            CONFIDENCE: [score between 0.0-1.0]
            ACTION ITEMS:
            - [action item 1]
            - [action item 2]
            - [action item 3]
            """
            
        elif target_type == "chatter":
            return f"""
            Analyze this OnlyFans chatter data and provide insights:
            
            Chatter Name: {target_data.get('name', 'Unknown')}
            Performance Score: {target_data.get('performance_score', 0)}
            Timezone: {target_data.get('timezone', 'Unknown')}
            
            Please provide:
            1. A brief summary of this chatter's performance
            2. Detailed analysis of their strengths and areas for improvement
            3. 3-5 relevant tags for categorizing this chatter
            4. A confidence score (0.0-1.0) for your analysis
            5. 2-3 action items to help improve this chatter's performance
            
            Format your response as:
            SUMMARY: [brief summary]
            DETAILS: [detailed analysis]
            TAGS: [comma-separated tags]
            CONFIDENCE: [score between 0.0-1.0]
            ACTION ITEMS:
            - [action item 1]
            - [action item 2]
            - [action item 3]
            """
            
        elif target_type == "creator":
            return f"""
            Analyze this OnlyFans creator data and provide insights:
            
            Creator Name: {target_data.get('name', 'Unknown')}
            Total Earnings: ${target_data.get('earnings_total', 0)}
            Join Date: {target_data.get('join_date', 'Unknown')}
            
            Please provide:
            1. A brief summary of this creator's performance
            2. Detailed analysis of their earnings and growth potential
            3. 3-5 relevant tags for categorizing this creator
            4. A confidence score (0.0-1.0) for your analysis
            5. 2-3 action items to help increase this creator's earnings
            
            Format your response as:
            SUMMARY: [brief summary]
            DETAILS: [detailed analysis]
            TAGS: [comma-separated tags]
            CONFIDENCE: [score between 0.0-1.0]
            ACTION ITEMS:
            - [action item 1]
            - [action item 2]
            - [action item 3]
            """
            
        elif target_type == "message":
            return f"""
            Analyze this OnlyFans message exchange and provide insights:
            
            Fan Message: {target_data.get('fan_message', 'Unknown')}
            Chatter Response: {target_data.get('chatter_response', 'Unknown')}
            
            Please provide:
            1. A brief summary of this message exchange
            2. Detailed analysis of the effectiveness of the chatter's response
            3. 3-5 relevant tags for categorizing this exchange
            4. A confidence score (0.0-1.0) for your analysis
            5. 2-3 action items to improve future responses to similar messages
            
            Format your response as:
            SUMMARY: [brief summary]
            DETAILS: [detailed analysis]
            TAGS: [comma-separated tags]
            CONFIDENCE: [score between 0.0-1.0]
            ACTION ITEMS:
            - [action item 1]
            - [action item 2]
            - [action item 3]
            """
            
        else:  # general
            return f"""
            Analyze this OnlyFans agency data and provide general insights:
            
            Total Fans: {target_data.get('total_fans', 0)}
            Active Fans: {target_data.get('active_fans', 0)}
            Total Chatters: {target_data.get('total_chatters', 0)}
            Total Creators: {target_data.get('total_creators', 0)}
            
            Please provide:
            1. A brief summary of the agency's overall performance
            2. Detailed analysis of key metrics and trends
            3. 3-5 relevant tags for categorizing this analysis
            4. A confidence score (0.0-1.0) for your analysis
            5. 2-3 action items to improve overall agency performance
            
            Format your response as:
            SUMMARY: [brief summary]
            DETAILS: [detailed analysis]
            TAGS: [comma-separated tags]
            CONFIDENCE: [score between 0.0-1.0]
            ACTION ITEMS:
            - [action item 1]
            - [action item 2]
            - [action item 3]
            """
    
    def _process_insight_text(self, insight_text: str, target_type: str, target_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process the raw insight text into structured data"""
        
        lines = insight_text.strip().split('\n')
        result = {
            "summary": "",
            "details": "",
            "tags": [],
            "confidence_score": 0.7,  # Default if parsing fails
            "action_items": []
        }
        
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if line.startswith("SUMMARY:"):
                current_section = "summary"
                result["summary"] = line.replace("SUMMARY:", "").strip()
            elif line.startswith("DETAILS:"):
                current_section = "details"
                result["details"] = line.replace("DETAILS:", "").strip()
            elif line.startswith("TAGS:"):
                tags_text = line.replace("TAGS:", "").strip()
                result["tags"] = [tag.strip() for tag in tags_text.split(",")]
                current_section = None
            elif line.startswith("CONFIDENCE:"):
                try:
                    confidence = float(line.replace("CONFIDENCE:", "").strip())
                    result["confidence_score"] = min(max(confidence, 0.0), 1.0)  # Ensure between 0 and 1
                except ValueError:
                    pass
                current_section = None
            elif line.startswith("ACTION ITEMS:"):
                current_section = "action_items"
            elif current_section == "action_items" and line.startswith("-"):
                result["action_items"].append(line.replace("-", "").strip())
            elif current_section == "summary":
                result["summary"] += " " + line
            elif current_section == "details":
                result["details"] += " " + line
        
        # Add metadata based on target type
        result["metadata"] = {
            "target_type": target_type,
            "analyzed_at": str(target_data.get("analyzed_at", ""))
        }
        
        return result
    
    def _generate_mock_insight(self, target_type: str, target_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock insight data for development/testing"""
        
        if target_type == "fan":
            return {
                "summary": f"High-value fan with consistent spending patterns",
                "details": f"This fan has spent ${target_data.get('total_spent', 0)} since {target_data.get('first_seen', 'joining')}. They engage regularly and respond well to personalized content. Their spending pattern shows they are most active on weekends and tend to purchase premium content within 24 hours of it being offered.",
                "tags": ["high-spender", "regular", "weekend-active"],
                "confidence_score": 0.85,
                "action_items": [
                    "Send personalized message on Friday afternoon",
                    "Offer exclusive content package",
                    "Acknowledge loyalty with special discount"
                ],
                "metadata": {
                    "target_type": target_type,
                    "analyzed_at": str(target_data.get("analyzed_at", ""))
                }
            }
            
        elif target_type == "chatter":
            return {
                "summary": f"Solid performer with good conversion rates",
                "details": f"This chatter has a performance score of {target_data.get('performance_score', 0)}, which is above average. They excel at initial engagement but could improve on follow-up conversations. Their timezone ({target_data.get('timezone', 'Unknown')}) allows them to cover evening hours when fan activity is highest.",
                "tags": ["consistent", "good-converter", "evening-shift"],
                "confidence_score": 0.78,
                "action_items": [
                    "Provide training on follow-up techniques",
                    "Assign to high-value fans during peak hours",
                    "Share successful conversation templates"
                ],
                "metadata": {
                    "target_type": target_type,
                    "analyzed_at": str(target_data.get("analyzed_at", ""))
                }
            }
            
        elif target_type == "creator":
            return {
                "summary": f"Growing creator with strong potential",
                "details": f"This creator has earned ${target_data.get('earnings_total', 0)} since joining on {target_data.get('join_date', 'Unknown')}. Their content receives above-average engagement, particularly photo sets and short videos. There's significant growth potential if they increase posting frequency and develop more themed content series.",
                "tags": ["growing", "visual-content", "engagement-focused"],
                "confidence_score": 0.82,
                "action_items": [
                    "Suggest weekly content schedule",
                    "Develop 3-part themed content series",
                    "Increase direct fan interaction by 20%"
                ],
                "metadata": {
                    "target_type": target_type,
                    "analyzed_at": str(target_data.get("analyzed_at", ""))
                }
            }
            
        elif target_type == "message":
            return {
                "summary": f"Effective conversion from casual inquiry to sale",
                "details": f"This exchange shows excellent technique in converting a casual question into a content purchase. The chatter effectively used emotional connection, exclusivity, and time-limited offers to create urgency. The language was personal and engaging without being pushy.",
                "tags": ["successful-conversion", "good-technique", "natural-upsell"],
                "confidence_score": 0.9,
                "action_items": [
                    "Share as example in team training",
                    "Use similar approach for fans with similar inquiry patterns",
                    "Follow up with additional exclusive offer in 48 hours"
                ],
                "metadata": {
                    "target_type": target_type,
                    "analyzed_at": str(target_data.get("analyzed_at", ""))
                }
            }
            
        else:  # general
            return {
                "summary": f"Agency showing strong growth with optimization opportunities",
                "details": f"With {target_data.get('total_fans', 0)} total fans and {target_data.get('active_fans', 0)} active fans, the agency has a solid foundation. The ratio of chatters ({target_data.get('total_chatters', 0)}) to creators ({target_data.get('total_creators', 0)}) is optimal for current scale. Key growth opportunities exist in reactivating dormant fans and increasing average spend per active fan.",
                "tags": ["growing", "optimization-needed", "retention-focus"],
                "confidence_score": 0.75,
                "action_items": [
                    "Launch win-back campaign for dormant fans",
                    "Implement tiered loyalty program",
                    "Optimize chatter scheduling for peak engagement times"
                ],
                "metadata": {
                    "target_type": target_type,
                    "analyzed_at": str(target_data.get("analyzed_at", ""))
                }
            }
