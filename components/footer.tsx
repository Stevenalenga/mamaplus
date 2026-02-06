import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-foreground text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo.png"
                alt="MamaPlus"
                width={280}
                height={94}
                className="brightness-0 invert"
              />
            </Link>
            <p className="text-white/70">Empowering caregivers globally</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-white/70">
              <li><Link href="/services" className="hover:text-primary transition">Features</Link></li>
              <li><Link href="/courses" className="hover:text-primary transition">Pricing</Link></li>
              <li><Link href="#" className="hover:text-primary transition">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-white/70">
              <li><Link href="#" className="hover:text-primary transition">About</Link></li>
              <li><Link href="#" className="hover:text-primary transition">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary transition">Careers</Link></li>
              <li><Link href="/partner" className="hover:text-primary transition">Partner with us</Link></li>
              <li><Link href="/donate" className="hover:text-primary transition">Donate</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-white/70">
              <li><Link href="#" className="hover:text-primary transition">Privacy</Link></li>
              <li><Link href="#" className="hover:text-primary transition">Terms</Link></li>
              <li><Link href="/partner" className="hover:text-primary transition">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8">
          <p className="text-white/50 text-center">&copy; {new Date().getFullYear()} MamaPlus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
