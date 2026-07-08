const favoriteArr = JSON.parse(localStorage.getItem("favoriteArr"));
export default function App() {
    return (
        <div className="top">
            <h1>ーお気に入り登録一覧ー</h1>
            <div className="favorite">
                {favoriteArr.map((item,i) => (
                    <>
                    <span>・お気に入り登録番号{i+1}番</span><br></br>
                    <span>年代: {item["年代"]}</span><br></br>
                    <span>交通行動: {item["交通行動"]}</span><br></br>
                    <span>{item["県名"].includes("道") ? "道名" : "県名"}: {item["県名"]}</span><br></br>
                    <span>来客者数: {item["来客者数"]}</span><br></br><br></br>
                    </>
                ))}
            </div>
        </div>
    )
}