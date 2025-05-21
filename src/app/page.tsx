import Image from "next/image";
import Link from "next/link";

export default function Page() {
    return (
        <>
            <div className="relateve h-screen w-full">
                {/* Fullscreen Background Image */}
                <Image
                    src="/images/cvsu-homebg.jpg"
                    alt="Cavite State University Background"
                    fill
                    priority
                    className="object-cover object-center brightness-75 -z-10"
                />
                {/* Hero Content */}
                <div className="flex flex-col items-center justify-center text-center py-24 w-full">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4" style={{fontFamily: 'cursive'}}>
                        Welcome!
                    </h1>
                    <p className="text-xl md:text-2xl font-semibold text-white drop-shadow mb-6">
                        Lost something? Found something?<br />
                        We're here to help – get started now!
                    </p>
                    <Link href="#about" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition">
                        Start here
                    </Link>
                </div>
                {/* About Section - White Card Over Background */}
                
            </div>
            <section id="about" className="w-full max-w-4xl mx-auto mt-12 mb-20 rounded-xl shadow p-8 md:p-12 bg-white bg-opacity-95 relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-black">About LF Hub</h2>
                        <Image src="/images/logo.png" alt="LF Hub Logo" width={40} height={40} className="rounded-full bg-white" />
                    </div>
                    <div className="text-black text-base md:text-lg leading-relaxed space-y-6">
                        <p>
                            At Lost and Found Hub, we believe that even the smallest acts of honesty and kindness can make a big difference. Founded with the goal of helping students at Cavite State University recover misplaced or forgotten items, our platform serves as a central digital space where the campus community can come together to report lost belongings or turn in found ones.
                        </p>
                        <p>
                            We understand how frustrating it can be to lose something important – whether it’s your student ID, a cherished hoodie, a gadget, or even a single notebook filled with class notes. That’s why we’ve designed this hub to be easy to use, reliable, and student-centered. With just a few clicks, anyone can browse listings, post about a lost item, or notify others of something they’ve found around the university grounds.
                        </p>
                        <p>
                            Our mission is to build a trustworthy system that not only helps recover personal items but also encourages a culture of responsibility, empathy, and cooperation among students. Every returned item is a small victory – and a reminder that we’re all in this together.
                        </p>
                        <p>
                            Whether you’re here because you’ve lost something or you want to do the right thing by reporting a found item, Lost and Found Hub is here to help. Let’s make Cavite State University a more connected and caring place, one item at a time.
                        </p>
                    </div>
                </section>
        </>
    );
}
