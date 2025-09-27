import React, { useState } from 'react';
import { Card, Row, Col, Typography, Tabs, Button, Spin } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import AIAnalysis from './AIAnalysis';
import NewsArticlesList from './NewsArticlesList';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const CompanyProfile = ({ company, newsArticles, analysisArticles }) => {
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  const generateCompanySummary = async () => {
    setLoading(true);
    try {
      // Combine news and analysis articles
      const allArticles = [...newsArticles, ...analysisArticles];
      const articlesText = allArticles.map(article => article.content || article.description).join('\n\n');

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: articlesText,
          prompt: `Please provide a comprehensive summary of the recent news and analysis about ${company.name}, focusing on key developments, market position, and future outlook.`
        }),
      });
      
      const data = await response.json();
      setAiSummary(data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="company-profile">
      <Card>
        <Title level={2}>{company.name}</Title>
        <Tabs defaultActiveKey="overview">
          <TabPane tab="Overview" key="overview">
            {/* Existing overview content */}
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card className="ai-summary-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Title level={4}>AI-Generated Company Summary</Title>
                    <Button 
                      type="primary" 
                      icon={<RobotOutlined />} 
                      onClick={generateCompanySummary}
                      loading={loading}
                    >
                      Generate AI Summary
                    </Button>
                  </div>
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Spin />
                      <Paragraph style={{ marginTop: 16 }}>
                        Analyzing recent news and developments...
                      </Paragraph>
                    </div>
                  ) : aiSummary ? (
                    <Paragraph>{aiSummary}</Paragraph>
                  ) : (
                    <Paragraph type="secondary">
                      Click the button above to generate an AI-powered summary of recent news and analysis about {company.name}.
                    </Paragraph>
                  )}
                </Card>
              </Col>
            </Row>
            {/* Other overview content */}
          </TabPane>

          <TabPane tab="News" key="news">
            <Row gutter={[16, 16]}>
              <Col span={16}>
                <NewsArticlesList articles={newsArticles} />
              </Col>
              <Col span={8}>
                <AIAnalysis articles={newsArticles} />
              </Col>
            </Row>
          </TabPane>
          
          {/* Other tabs */}
        </Tabs>
      </Card>
    </div>
  );
};

export default CompanyProfile; 