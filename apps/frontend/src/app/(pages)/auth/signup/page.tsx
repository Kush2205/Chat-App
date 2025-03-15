"use client"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Loader } from "@repo/ui/loader"
import { Modal } from "@repo/ui/modal"
import { Roboto } from "next/font/google"
import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

const roboto = Roboto({
    weight: '400',
    subsets: ['latin'],
})

export default function SignUp() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const[error , setError] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const url = process.env.NEXT_PUBLIC_BACKEND_URL

    const signup = async () => {
        if(!name || !email || !password){
            setIsModalOpen(true)
            return
        }
        try {
            setLoading(true)
            const response = await axios.post(`${url}/api/auth/signup`, {
                name: name,
                email: email,
                password: password
            })
            if(response.data.token){
                localStorage.setItem("token", response.data.token)
                router.push("/rooms/joinroom")
            }
            
        } catch (error :any) {
            setError(error.response.data.error)
            
            setIsModalOpen(true)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative">
            <div className="flex">
                <div 
                    className="w-[50%] h-screen flex justify-center items-center" 
                    style={{ backgroundImage: `url("https://img.freepik.com/premium-vector/hand-drawn-ink-chat-bubble-set-pattern_1027691-779.jpg?w=740")`, backgroundPosition: "center" }}
                >
                    <div className="w-[400px] h-[450px] bg-neutral-800 rounded-xl flex flex-col">
                        <div
                            style={{ fontFamily: roboto.style.fontFamily }}
                            className="text-4xl font-bold text-white text-center mt-4"
                        >
                            Sign Up
                        </div>
                        <div className="flex flex-col flex-1 p-4 space-y-4 justify-center items-center w-full">
                            <Input onChange={(e) => setName(e.target.value)} placeholder="Name" type="text" height="40px" width="350px" />
                            <Input onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" height="40px" width="350px" />
                            <Input onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" height="40px" width="350px" />
                        </div>
                        <div>
                            <h1 className="text-center text-slate-200">
                                Already have an account? <span className="text-blue-400 hover:underline hover:cursor-pointer" onClick={() => router.push("/auth/signin")}>Sign In</span>
                            </h1>
                        </div>
                        <div className="flex flex-col p-6 space-y-4 justify-center items-center w-full">
                            <Button width="100px" height="40px" text="Sign Up" backgroundColor="#5e84f1" color="white" textSize="20px" onClick={signup} />
                        </div>
                    </div>
                </div>

                <div className="w-[50%] h-screen flex justify-center items-center">
                    {/* Additional content can be placed here */}
                </div>
            </div>
            
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Loader />
                </div>
            )}

            {isModalOpen && (
                <Modal textSize="24px" color="white" backgroundColor="#1f1f1f" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Error">
                    <div className="text-red-300 text-2xl">{error}</div>
                </Modal>
            )}
        </div>
    )
}