import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

export const Footer = () => (
    <footer className="bg-surface-1 border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                <div>
                    <span className="font-display text-2xl font-bold gradient-text">ZYRA</span>
                    <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                        Premium clothing for every occasion. Style meets comfort in every stitch.
                    </p>
                    <div className="flex gap-4 mt-6">
                        {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                            <a key={i} href="#" className="text-gray-500 hover:text-brand-400 transition-colors">
                                <Icon size={20} />
                            </a>
                        ))}
                    </div>
                </div>

                {[
                    {
                        title: 'Shop',
                        links: [
                            { label: 'Men', href: '/products?category=men' },
                            { label: 'Women', href: '/products?category=women' },
                            { label: 'Kids', href: '/products?category=kids' },
                            { label: 'Accessories', href: '/products?category=accessories' },
                            { label: 'New Arrivals', href: '/products?sort=newest' },
                        ],
                    },
                    {
                        title: 'Support',
                        links: [
                            { label: 'FAQ', href: '#' },
                            { label: 'Shipping Info', href: '#' },
                            { label: 'Returns', href: '#' },
                            { label: 'Size Guide', href: '#' },
                            { label: 'Track Order', href: '/account/orders' },
                        ],
                    },
                    {
                        title: 'Company',
                        links: [
                            { label: 'About Us', href: '#' },
                            { label: 'Careers', href: '#' },
                            { label: 'Press', href: '#' },
                            { label: 'Privacy Policy', href: '#' },
                            { label: 'Terms of Service', href: '#' },
                        ],
                    },
                ].map(section => (
                    <div key={section.title}>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{section.title}</h3>
                        <ul className="mt-4 space-y-2">
                            {section.links.map(link => (
                                <li key={link.label}>
                                    <Link to={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-xs text-gray-500">© {new Date().getFullYear()} Zyra. All rights reserved.</p>
                <div className="flex gap-4">
                    {['Visa', 'Mastercard', 'UPI', 'Stripe'].map(p => (
                        <span key={p} className="text-xs text-gray-500 border border-white/10 rounded px-2 py-1">{p}</span>
                    ))}
                </div>
            </div>
        </div>
    </footer>
);
