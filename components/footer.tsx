import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-foreground text-white py-10 px-4 sm:px-6 lg:px-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo.png"
                alt="MamaPlus"
                width={280}
                height={94}
                className="brightness-0 invert h-8 w-auto sm:h-10"
              />
            </Link>
            <p className="text-white/70 text-sm sm:text-base">
              Professional childcare training that raises the quality of care for children across Kenya.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Learn</h4>
            <ul className="space-y-2 text-white/70 text-sm sm:text-base">
              <li><Link href="/courses" className="hover:text-primary transition">Courses</Link></li>
              <li><Link href="/learn" className="hover:text-primary transition">Learn</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition">Blog</Link></li>
              <li><Link href="/about-us" className="hover:text-primary transition">About</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Who we serve</h4>
            <ul className="space-y-2 text-white/70 text-sm sm:text-base">
              <li><Link href="/families" className="hover:text-primary transition">Families</Link></li>
              <li><Link href="/caregivers" className="hover:text-primary transition">Caregivers</Link></li>
              <li><Link href="/agencies-partners" className="hover:text-primary transition">Agencies</Link></li>
              <li><Link href="/services" className="hover:text-primary transition">How training is applied</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Get involved</h4>
            <ul className="space-y-2 text-white/70 text-sm sm:text-base">
              <li><Link href="/partner" className="hover:text-primary transition">Partner</Link></li>
              <li><Link href="/donate" className="hover:text-primary transition">Donate</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition">Contact</Link></li>
              <li><Link href="/services/quicksignup" className="hover:text-primary transition">Quick signup</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8">
          <p className="text-white/50 text-center text-sm sm:text-base">&copy; {new Date().getFullYear()} MamaPlus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
