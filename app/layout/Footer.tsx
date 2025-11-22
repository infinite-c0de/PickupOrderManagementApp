function Footer(){
    return (
        <div className="w-full h-[150px] border-t-2 flex items-center px-[5%] py-[20px] bg-[#333] text-[#fff]" style={{ flexDirection: 'column', justifyContent: 'space-between'}}>
            <a href="https://www.fca.org/" target="_blank" rel="noreferrer">
            <img src="https://lirp.cdn-website.com/3ee67482/dms3rep/multi/opt/SIGN_FCA_FooterName_Craft-1920w.png" className="inline-block"/>
            </a>
             <a className="cursor-pointer hover:underline bg-[#c4622a] border-[#c4622a] text-white px-4 py-3 rounded" href="mailto:supportservices@fca.org">Submit a request</a>
        </div>
    )
}

export default Footer