import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen font-sans bg-white">
            <Header />

            {/* main chứa nội dung các trang: Trang chủ, Tin tức, Liên hệ... */}
            <main className="flex-1">
                {children}
            </main>

            <Footer />
        </div>
    );
}