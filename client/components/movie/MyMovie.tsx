export default function MyMovie() {
  return (
    <div style={{padding: '0 20px'}}>
      <div style={{display: 'flex'}}>
          <h4>내영화 리스트</h4>
          <button>목록형</button>
          <button>앨범형</button>
      </div>
      <div>
        <table>
            <tr>
                <td width="10%"><button>날짜</button></td>
                <td width="65%"><button>제목</button></td>
                <td width="15%"><button>별점</button></td>
                <td width="10%"></td>
                <td></td>
            </tr>
        </table>
        <table>
            <tr>
                <td width="10%">                    
                </td>
                <td width="65%">
                </td>
                <td width="15%" >
                </td>
                <td width="10%">
                    <button>삭제</button>
                </td>
            </tr>
        </table>
      </div>
      <div>
          <div>
          </div>
      </div>
    </div>
  )
}