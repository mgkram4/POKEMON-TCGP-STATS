interface DeckPerformanceProps {
  winRate: string;
  metaShare: string;
  totalGames: number;
  favorableMatchups: number;
}

const DeckPerformance = ({ winRate, metaShare, totalGames, favorableMatchups }: DeckPerformanceProps) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Deck Performance</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-gray-600">Win Rate</div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${winRate}%` }}
              ></div>
            </div>
            <span className="ml-2 font-bold">{winRate}%</span>
          </div>
        </div>
        
        <div>
          <div className="text-gray-600">Meta Share</div>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${metaShare}%` }}
              ></div>
            </div>
            <span className="ml-2 font-bold">{metaShare}%</span>
          </div>
        </div>

        <div>
          <div className="text-gray-600">Total Games</div>
          <div className="font-bold text-lg">{totalGames.toLocaleString()}</div>
        </div>

        <div>
          <div className="text-gray-600">Favorable Matchups</div>
          <div className="font-bold text-lg">{favorableMatchups}</div>
        </div>
      </div>
    </div>
  );
};

export default DeckPerformance; 