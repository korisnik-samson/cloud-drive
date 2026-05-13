import Grainient from "@/components/grainient";
import LandingNavBar from "@/components/landing-navbar";
import { Button } from "@/components/ui/button";
import { Link } from "next/link";

export default function LandingPage() {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
            <div className="absolute inset-0 z-0">
                <Grainient className="w-full h-full" color1="#727072" color2="#3c3b3b" color3="#747376" timeSpeed={0.45} colorBalance={0}
                warpStrength={1.75} warpFrequency={5} warpSpeed={2} warpAmplitude={50} blendAngle={0} blendSoftness={0.05}
                rotationAmount={500} noiseScale={2} grainAmount={0.1} grainScale={2} grainAnimated={false} contrast={1.5}
                gamma={1} saturation={1} centerX={0} centerY={0} zoom={0.9} />
            </div>

            {/* Navigation */}
            <LandingNavBar />

            {/* Main Content */}
            <main className="relative z-10 flex flex-col items-center justify-center flex-1 w-full px-4 mb-20">
                <div className="mb-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-black text-xs text-white font-semibold shadow">
                        <span className="bg-white text-black rounded-full px-2 py-0.5 mr-2 text-xs font-bold -mx-2">NEW</span>
                        Newly deployed v1.0
                    </span>
                </div>

                <h1 className="text-6xl md:text-5xl xl:text-6xl font-semibold text-white text-center mb-6 drop-shadow-lg">
                    Welcome to a new realm of <br/>Cloud applications
                </h1>

                <div className="flex gap-4 mt-6">
                    <Button className="px-6 py-3 bg-white text-black font-bold shadow transition">
                        Get started
                    </Button>

                    <Link href="/auth/sign-up">
                        <Button className="px-6 py-3 bg-black text-white font-bold shadow transition hover:bg-black">
                            Learn more
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
