import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await base44.integrations.Core.SendEmail({
        to: 'hello@studio22.app',
        subject: `Contact Form: ${formData.subject}`,
        body: `
Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}
        `
      });
      
      setSubmitted(true);
    } catch (error) {
      alert('Error sending message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Message Sent</h1>
          <p className="text-xl text-gray-400 mb-8">
            Thank you for reaching out. We'll get back to you within 24 hours.
          </p>
          <Link to={createPageUrl('Home')}>
            <Button variant="outline" className="border-zinc-700">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-400">
            Have questions? We're here to help
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Mail className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Email</p>
                    <a href="mailto:hello@studio22.app" className="text-gray-400 hover:text-amber-600">
                      hello@studio22.app
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <MapPin className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">European Network</p>
                    <p className="text-gray-400">
                      Active in Amsterdam, Barcelona, Berlin, Brussels, and 8+ European cities
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="font-semibold mb-4">Looking to submit a project?</h3>
              <p className="text-sm text-gray-400 mb-4">
                Use our guided project intake form for the fastest response
              </p>
              <Link to={createPageUrl('SubmitProject')}>
                <Button variant="outline" className="w-full border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white">
                  Submit Project
                </Button>
              </Link>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="font-semibold mb-4">Want to join our network?</h3>
              <p className="text-sm text-gray-400 mb-4">
                Apply as an artist or team to work on Studio22 projects
              </p>
              <div className="flex flex-col gap-2">
                <Link to={createPageUrl('ApplyArtist')}>
                  <Button variant="outline" size="sm" className="w-full">
                    Apply as Artist
                  </Button>
                </Link>
                <Link to={createPageUrl('ApplyTeam')}>
                  <Button variant="outline" size="sm" className="w-full">
                    Apply as Team
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-base mb-2 block">Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-base mb-2 block">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 h-12"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-base mb-2 block">Subject *</Label>
                  <Input
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="bg-zinc-800 border-zinc-700 h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-base mb-2 block">Message *</Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={8}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-600 hover:bg-amber-700 h-12 text-base"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  <Send className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}