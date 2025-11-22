import Link from "next/link";

export default function Header(){
    return (
        <div className="flex justify-between items-center max-w-[1160px] w-[100%]  px-[5%] lg:p-0  mx-auto h-[71px] bg-[#fff]">
            <div>
                <Link href={'/'}>
                <img className="w-[150px] h-[65px]" src="https://irp.cdn-website.com/3ee67482/dms3rep/multi/247_Logo_Emblem+FCA+Lockup-e8b300af.svg"/>
                </Link>
            </div>
            <div className="flex justify-center items-center text-[#fff]">
                <a className="cursor-pointer hover:underline bg-[#c4622a] border-[#c4622a] text-white px-4 py-3 rounded" href="mailto:supportservices@fca.org">Submit a request</a>
            </div>
        </div>
    )
}