import Master from '@/app/layout/Master';
import SearchField from './component/SearchField';
import MainField from './component/MainField';

function index(){
  return (
    <>
      <Master>
        <SearchField/>
        <MainField/>
      </Master>
    </>
  )
}
export default index