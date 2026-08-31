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
              Trusted childcare starts with trained caregivers. MamaPlus trains and certifies caregivers, supports families, and partners with organisations across Kenya.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-white/70 text-sm sm:text-base">
              <li><Link href="/families" className="hover:text-primary transition">Families</Link></li>
              <li><Link href="/caregivers" className="hover:text-primary transition">Caregivers</Link></li>
              <li><Link href="/courses" className="hover:text-primary transition">Training</Link></li>
              <li><Link href="/partner" className="hover:text-primary transition">Childcare centres</Link></li>
              <li><Link href="/learn" className="hover:text-primary transition">Resources</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-white/70 text-sm sm:text-base">
              <li><Link href="/about-us" className="hover:text-primary transition">About us</Link></li>
              <li><Link href="/agencies-partners" className="hover:text-primary transition">Partners</Link></li>
              <li><Link href="/donate" className="hover:text-primary transition">Donate</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-white/70 text-sm sm:text-base">
              <li>Nairobi, Kenya</li>
              <li>
                <a href="tel:+254769886655" className="hover:text-primary transition">+254 769 886655</a>
              </li>
              <li>
                <a href="tel:+254769886644" className="hover:text-primary transition">+254 769 886644</a>
              </li>
              <li>
                <a href="mailto:mamapluske@gmail.com" className="hover:text-primary transition">mamapluske@gmail.com</a>
              </li>
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
