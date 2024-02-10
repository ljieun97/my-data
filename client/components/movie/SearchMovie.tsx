export default function SearchMovie() {
  return (
    <>
    <div style={{padding: '0 20px'}}>
      <div style={{display: 'flex'}}>
        <input 
            type="text" 
            placeholder="영화 제목"
            style={{width: '100%'}}
        />
      </div>
      <div>
        <table style={{backgroundColor: '', textAlign: 'center', width: '100%'}}>
          <tbody>
            <tr>
              <td width="10%">                    
                <input 
                  type="date"
                />
              </td>
              <td width="65%"><br/>
              </td>
              <td width="15%" >
              </td>
              <td width="10%">
                  <button>등록</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </>
  )
}