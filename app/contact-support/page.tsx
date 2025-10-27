// app/contact-support/page.tsx
"use client"

import { useState } from "react"
import { WaveBackground } from "@/components/common/Wave-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ContactSupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({ name: "", email: "", subject: "", message: "" })
    }, 1500)
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const contactMethods = [
    {
      icon: "mail",
      title: "Email Us",
      description: "Send us an email and we'll respond within 24 hours",
      contact: "support@hearsafe.com",
      action: "mailto:support@hearsafe.com"
    },
    {
      icon: "phone",
      title: "Call Us",
      description: "Speak directly with our support team",
      contact: "+1 (555) 123-HEAR",
      action: "tel:+15551234327"
    },
    {
      icon: "schedule",
      title: "Office Hours",
      description: "Our support team availability",
      contact: "Mon-Fri: 9AM-6PM EST",
      action: null
    },
    {
      icon: "forum",
      title: "Live Chat",
      description: "Get instant help from our team",
      contact: "Available during office hours",
      action: null
    }
  ]

  const faqs = [
    {
      question: "How accurate is the hearing test?",
      answer: "Our test is designed as a screening tool to identify potential hearing issues. While it provides valuable insights, it should not replace a comprehensive evaluation by a licensed audiologist."
    },
    {
      question: "Is my test data private and secure?",
      answer: "Yes, we take your privacy seriously. All test results and personal information are encrypted and stored securely. We never share your data without your explicit consent."
    },
    {
      question: "Can I take the test multiple times?",
      answer: "Absolutely! We encourage regular monitoring. You can retake the test as often as you'd like to track changes in your hearing health over time."
    },
    {
      question: "Do I need special equipment for the test?",
      answer: "For best results, we recommend using headphones in a quiet environment. The test works on most modern devices with audio capabilities."
    }
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen">
        <WaveBackground />
        <div className="relative z-10 max-w-2xl mx-auto p-6 flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">Message Sent Successfully!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for reaching out to HearSafe support. We've received your message and will get back to you within 24 hours.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setIsSubmitted(false)}
                className="w-full"
              >
                Send Another Message
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/'}
              >
                Return to Homepage
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <WaveBackground />
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-4xl font-bold mb-4 mt-20">Contact Support</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're here to help you with any questions about your hearing health journey
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Methods */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Get In Touch</h2>
              <div className="space-y-6">
                {contactMethods.map((method, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary">{method.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{method.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                      {method.action ? (
                        <a 
                          href={method.action} 
                          className="text-primary font-medium hover:underline"
                        >
                          {method.contact}
                        </a>
                      ) : (
                        <span className="text-primary font-medium">{method.contact}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Emergency Notice */}
              <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-orange-500 flex-shrink-0">warning</span>
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-1">Medical Emergency</h4>
                    <p className="text-sm text-orange-600">
                      If you're experiencing sudden hearing loss, severe pain, or other urgent symptoms, 
                      please seek immediate medical attention or call emergency services.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="What is this regarding?"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Please describe your question or concern in detail..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Message...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By submitting this form, you agree to our privacy policy and terms of service.
                </p>
              </form>
            </Card>

            {/* FAQ Section with Dropdowns */}
            <Card className="p-8 mt-8">
              <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-secondary/50 transition-colors"
                    >
                      <span className="font-semibold text-lg pr-4">{faq.question}</span>
                      <span 
                        className={`material-symbols-outlined transition-transform duration-300 ${
                          openFaq === index ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                    
                    <div 
                      className={`px-6 overflow-hidden transition-all duration-300 ${
                        openFaq === index ? 'max-h-48 pb-4' : 'max-h-0'
                      }`}
                    >
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button variant="outline">
                  View All FAQs
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Support Resources */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-500">download</span>
            </div>
            <h3 className="font-semibold mb-2">User Guides</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Download comprehensive guides and tutorials
            </p>
            <Button variant="outline" size="sm">
              Download Resources
            </Button>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-500">video_library</span>
            </div>
            <h3 className="font-semibold mb-2">Video Tutorials</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Watch step-by-step video guides
            </p>
            <Button variant="outline" size="sm">
              Watch Videos
            </Button>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-500">groups</span>
            </div>
            <h3 className="font-semibold mb-2">Community Forum</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with other HearSafe users
            </p>
            <Button variant="outline" size="sm">
              Join Community
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}