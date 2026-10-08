import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/landing/backstage/Navbar'
import Footer from '@/components/landing/backstage/Footer'
import ChatWidget from '@/components/landing/backstage/ChatWidget'
import SEOMetaTags from '@/components/SEOMetaTags'

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I create a profile on SmartGigs Kenya?',
        a: 'To create a profile, click the "Join" button in the navigation bar and select whether you are Talent (actors, crew) or Hiring (producers, casting directors). Fill in your details, upload your portfolio, and you are ready to start applying for gigs or posting jobs.',
      },
      {
        q: 'Is SmartGigs Kenya free to use?',
        a: 'Creating a basic profile and browsing gigs is free. We offer premium subscription plans for talent who want enhanced visibility and additional features. Producers can post jobs with various pricing tiers depending on their needs.',
      },
      {
        q: 'What types of talent can I find on SmartGigs Kenya?',
        a: 'You can find actors, voiceover artists, cinematographers, editors, sound designers, makeup artists, wardrobe stylists, location managers, and many other film and TV professionals.',
      },
    ],
  },
  {
    category: 'For Talent',
    questions: [
      {
        q: 'How do I apply for a gig?',
        a: 'Browse the available gigs on the platform, click on a gig that interests you, and submit your application. Make sure your profile is complete with your portfolio, photos, and video reel to increase your chances of getting hired.',
      },
      {
        q: 'What should I include in my portfolio?',
        a: 'Your portfolio should include high-resolution photos, video reels of your work, past projects, skills, and availability. You can also embed YouTube links for video content.',
      },
      {
        q: 'How will I know if I am selected for a gig?',
        a: 'You will receive notifications through the platform when a producer views your application or selects you for a gig. You can also track the status of all your applications in your dashboard.',
      },
      {
        q: 'Can I communicate with producers directly?',
        a: 'Yes, once you are connected through an application, you can use our in-app messaging system to communicate with producers.',
      },
    ],
  },
  {
    category: 'For Producers & Casting Directors',
    questions: [
      {
        q: 'How do I post a job?',
        a: 'Click "Post a Job" and fill in the details about the role, including job description, location, required skills, and compensation. Your job will be visible to all relevant talent on the platform.',
      },
      {
        q: 'How can I filter submissions?',
        a: 'You can filter incoming applications by location, skills, custom tags, and other criteria. Our advanced talent search helps you find the perfect match for your project.',
      },
      {
        q: 'How do I manage applications?',
        a: 'Your dashboard shows all applications for your posted jobs. You can review submissions, move candidates through different stages (applied, under review, shortlisted, hired), and communicate with applicants through our messaging system.',
      },
      {
        q: 'Can I post jobs for different types of talent?',
        a: 'Yes, you can post jobs for actors, crew members, voiceover artists, and other film professionals. Specify the role type and requirements in your job posting.',
      },
    ],
  },
  {
    category: 'Shop & Auctions',
    questions: [
      {
        q: 'How does the shop work?',
        a: 'The SmartGigs Shop features branded merchandise, film equipment, and collectibles. You can purchase items at the listed price or participate in live auctions for a chance to win items at a discount.',
      },
      {
        q: 'What are the two types of auctions?',
        a: 'We have time-based auctions (run for a set duration like 1 hour or 30 days) and count-based auctions (require a target number of participants like 1000 users). When the auction ends, a winner is selected randomly.',
      },
      {
        q: 'How do I join an auction?',
        a: 'Click "Grab Discount" on an auction product. You will need to be logged in to participate. Once joined, you are entered into the random selection when the auction ends.',
      },
      {
        q: 'What happens if I win an auction?',
        a: 'If you are selected as the winner, you will be notified and can purchase the item at the discounted auction price.',
      },
    ],
  },
  {
    category: 'Account & Security',
    questions: [
      {
        q: 'How do I reset my password?',
        a: 'Click "Sign in" and then "Forgot password". Enter your email address, and we will send you a link to reset your password.',
      },
      {
        q: 'Is my information secure?',
        a: 'Yes, we use industry-standard encryption and security measures to protect your personal information. We never share your data with third parties without your consent.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes, you can request to delete your account from your profile settings. Please note that this action is irreversible and all your data will be permanently removed.',
      },
    ],
  },
  {
    category: 'Payment & Billing',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept M-Pesa, credit/debit cards, and other payment methods depending on your location.',
      },
      {
        q: 'How do I get paid for gigs?',
        a: 'Payment terms are agreed upon between you and the producer. SmartGigs Kenya provides a platform for connecting talent and producers but does not handle payments directly for gigs.',
      },
      {
        q: 'Are shop payments secure?',
        a: 'Yes, all shop payments are processed through secure payment gateways. We do not store your payment card information on our servers.',
      },
    ],
  },
]

export default function FAQ() {
  return (
    <div className="min-h-screen bg-white">
      <SEOMetaTags
        title="FAQ — SmartGigs Kenya"
        description="Frequently asked questions about SmartGigs Kenya - how to use the platform, apply for gigs, post jobs, and more."
        keywords="faq, smartgigs kenya, help, support, questions"
        ogType="website"
        schemaType="WebPage"
        schemaData={{ name: 'FAQ SmartGigs Kenya', description: 'Common questions about SmartGigs Kenya' }}
      />
      <Navbar />

      {/* Hero */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-serif text-3xl font-bold text-black md:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-base text-gray-600 md:text-lg">
            Find answers to common questions about using SmartGigs Kenya
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          {faqs.map((category) => (
            <div key={category.category}>
              <h2 className="mb-6 font-serif text-2xl font-bold text-black">{category.category}</h2>
              <div className="space-y-6">
                {category.questions.map((faq, idx) => (
                  <div key={idx} className="rounded-2xl border border-black/5 bg-[#F5F3EF] p-6">
                    <h3 className="text-lg font-semibold text-black">{faq.q}</h3>
                    <p className="mt-3 text-base text-gray-700">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl bg-[#4F46E5] px-6 py-12 text-center md:px-12">
          <h2 className="font-serif text-2xl font-bold text-white md:text-3xl">
            Still have questions?
          </h2>
          <p className="mt-4 text-base text-white/80">
            Our support team is here to help you with any questions you may have.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/Contact" className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#4F46E5] hover:bg-gray-100">
              Contact Us
            </Link>
            <Link to="/About" className="rounded-full border border-white/40 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  )
}
