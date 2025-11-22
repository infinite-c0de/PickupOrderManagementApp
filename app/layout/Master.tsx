import Header from '@/app/layout/Header';
import Footer from '@/app/layout/Footer';

function Master({ children }: React.PropsWithChildren<{}>) {
    return (
        <div className='w-full bg-white min-h-screen text-black'>
            <Header/>
            {children}
            <Footer/>
        </div>
    )
}

export default Master;