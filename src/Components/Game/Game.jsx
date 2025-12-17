import React, { useState } from 'react';
import { Shield, Coins, Wheat, Users, Castle, Hammer, Sword } from 'lucide-react';
// Імпортуємо модуль стилів
import styles from './Game.module.css';

const Game = () => {
  // --- State ---
  const [resources, setResources] = useState({
    gold: 100,
    food: 100,
    population: 10,
    army: 0,
  });

  const [buildings, setBuildings] = useState({
    farm: 1,
    mine: 0,
    barracks: 0,
    houses: 1,
  });

  const [turn, setTurn] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [logs, setLogs] = useState(["Ласкаво просимо, Ваша Величносте!"]);

  // --- Config ---
  const COSTS = {
    farm: { gold: 50, food: 0 },
    mine: { gold: 100, food: 20 },
    barracks: { gold: 150, food: 50 },
    houses: { gold: 30, food: 30 },
    soldier: { gold: 20, food: 50 },
    wonder: { gold: 1000, food: 1000, population: 50 } 
  };

  const PRODUCTION = {
    farm: 15,
    mine: 10,
    houseSpace: 5,
  };

  // --- Logic ---
  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 6));
  };

  const handleNextTurn = () => {
    if (gameOver || victory) return;

    setTurn(t => t + 1);

    const foodProd = buildings.farm * PRODUCTION.farm;
    const goldProd = (buildings.mine * PRODUCTION.mine) + (resources.population * 1);
    const foodCons = (resources.population * 2) + (resources.army * 3);
    
    const maxPop = buildings.houses * PRODUCTION.houseSpace;
    let popChange = 0;
    if (foodProd > foodCons && resources.population < maxPop) {
      popChange = 1;
    }

    let newFood = resources.food + foodProd - foodCons;
    let newGold = resources.gold + goldProd;
    let newPop = resources.population + popChange;
    let newArmy = resources.army;

    const eventRoll = Math.random();
    let eventMsg = "";

    if (newFood < 0) {
      const deaths = Math.floor(Math.abs(newFood) / 5) + 1;
      newPop = Math.max(0, newPop - deaths);
      newFood = 0;
      eventMsg = `💀 Голод! Померло ${deaths} жителів.`;
    }

    if (turn > 5 && eventRoll < 0.25) {
      const enemyStrength = Math.floor(turn * 1.2) + 2;
      if (newArmy >= enemyStrength) {
        const loot = Math.floor(enemyStrength * 5);
        newGold += loot;
        eventMsg = `⚔️ Напад відбито! (+${loot} золота)`;
      } else {
        const damage = enemyStrength - newArmy;
        newGold = Math.max(0, newGold - (damage * 10));
        newPop = Math.max(0, newPop - Math.floor(damage / 2));
        eventMsg = `🔥 Нас пограбували! Втрати ресурсів і людей.`;
      }
    }

    if (eventMsg) addLog(eventMsg);

    setResources({ gold: newGold, food: newFood, population: newPop, army: newArmy });

    if (newPop <= 0) {
      setGameOver(true);
      addLog("☠️ Королівство спорожніло. Гра закінчена.");
    }
  };

  const buyBuilding = (type) => {
    if (gameOver) return;
    const cost = COSTS[type];
    if (resources.gold >= cost.gold && resources.food >= cost.food) {
      setResources(prev => ({ ...prev, gold: prev.gold - cost.gold, food: prev.food - cost.food }));
      setBuildings(prev => ({ ...prev, [type]: prev[type] + 1 }));
      const names = { houses: "Будинок", farm: "Ферма", mine: "Шахта", barracks: "Казарма" };
      addLog(`🔨 Побудовано: ${names[type]}`);
    } else {
      addLog("❌ Недостатньо ресурсів!");
    }
  };

  const recruitSoldier = () => {
    if (gameOver) return;
    const cost = COSTS.soldier;
    if (resources.gold >= cost.gold && resources.food >= cost.food && resources.population > 1) {
      setResources(prev => ({ ...prev, gold: prev.gold - cost.gold, food: prev.food - cost.food, population: prev.population - 1, army: prev.army + 1 }));
      addLog("🛡️ Найнято солдата!");
    } else {
      addLog("❌ Треба золото, їжа та люди!");
    }
  };

  const buildWonder = () => {
    const cost = COSTS.wonder;
    if (resources.gold >= cost.gold && resources.food >= cost.food && resources.population >= cost.population) {
      setVictory(true);
      addLog("🏆 ВЕЛИКИЙ ЗАМОК ПОБУДОВАНО!");
    }
  };

  // --- Components ---
  const ResourceItem = ({ icon: Icon, label, value, sub, borderColorClass }) => (
    <div className={`${styles.resourceCard} ${borderColorClass}`}>
      <div className={styles.resHeader}>
        <Icon size={18} />
        <span>{label}</span>
      </div>
      <div className={styles.resValue}>{value}</div>
      {sub && <div className={styles.resSub}>{sub}</div>}
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.title}>
            <h1>Pocket Kingdom</h1>
            <p className={styles.subtitle}>Стратегія управління</p>
          </div>
          <div className={styles.turnBadge}>
            ХІД: {turn}
          </div>
        </header>

        {/* Resources */}
        <div className={styles.resourceGrid}>
          <ResourceItem 
            icon={Coins} label="Золото" value={Math.floor(resources.gold)} 
            borderColorClass={styles.borderYellow} 
          />
          <ResourceItem 
            icon={Wheat} label="Їжа" value={Math.floor(resources.food)} 
            borderColorClass={styles.borderGreen} 
          />
          <ResourceItem 
            icon={Users} label="Люди" value={resources.population} 
            sub={`Макс: ${buildings.houses * PRODUCTION.houseSpace}`}
            borderColorClass={styles.borderBlue} 
          />
          <ResourceItem 
            icon={Shield} label="Армія" value={resources.army} 
            borderColorClass={styles.borderRed} 
          />
        </div>

        <div className={styles.mainGrid}>
          
          {/* Left Column */}
          <div className={styles.leftColumn}>
            
            {/* Buildings */}
            <div className={styles.sectionCard}>
              <h3 className={styles.sectionTitle}>
                <Hammer size={20} color="#6366f1"/> Будівництво
              </h3>
              
              <div className={styles.buildingList}>
                <button onClick={() => buyBuilding('houses')} className={`${styles.buildBtn} ${styles.bgBlue}`}>
                  <div className={styles.buildInfo}>
                    <span className={styles.buildName}>🏠 Будинок (Рівень {buildings.houses})</span>
                    <span className={styles.buildDesc}>+5 місць</span>
                  </div>
                  <div className={styles.buildCost}>🟡{COSTS.houses.gold} 🍏{COSTS.houses.food}</div>
                </button>

                <button onClick={() => buyBuilding('farm')} className={`${styles.buildBtn} ${styles.bgGreen}`}>
                  <div className={styles.buildInfo}>
                    <span className={styles.buildName}>🌾 Ферма (Рівень {buildings.farm})</span>
                    <span className={styles.buildDesc}>+{PRODUCTION.farm} їжі</span>
                  </div>
                  <div className={styles.buildCost}>🟡{COSTS.farm.gold}</div>
                </button>

                <button onClick={() => buyBuilding('mine')} className={`${styles.buildBtn} ${styles.bgYellow}`}>
                  <div className={styles.buildInfo}>
                    <span className={styles.buildName}>⛏️ Шахта (Рівень {buildings.mine})</span>
                    <span className={styles.buildDesc}>+{PRODUCTION.mine} золота</span>
                  </div>
                  <div className={styles.buildCost}>🟡{COSTS.mine.gold} 🍏{COSTS.mine.food}</div>
                </button>

                <button onClick={() => buyBuilding('barracks')} className={`${styles.buildBtn} ${styles.bgRed}`}>
                  <div className={styles.buildInfo}>
                    <span className={styles.buildName}>⚔️ Казарма (Рівень {buildings.barracks})</span>
                    <span className={styles.buildDesc}>Військо</span>
                  </div>
                  <div className={styles.buildCost}>🟡{COSTS.barracks.gold} 🍏{COSTS.barracks.food}</div>
                </button>
              </div>
            </div>

            {/* Army */}
            <div className={styles.sectionCard}>
               <h3 className={styles.sectionTitle}>
                <Sword size={20} color="#ef4444"/> Оборона
              </h3>
              {buildings.barracks > 0 ? (
                <div className={styles.recruitBox}>
                  <div className={styles.buildInfo}>
                    <span className={styles.buildName} style={{color: '#7f1d1d'}}>Найняти Солдата</span>
                    <span className={styles.buildDesc}>Потребує: 1 людину, {COSTS.soldier.gold} зол, {COSTS.soldier.food} їжі</span>
                  </div>
                  <button onClick={recruitSoldier} className={styles.recruitBtn}>Найняти</button>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  Побудуйте казарму, щоб тренувати військо.
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            
            {/* Logs */}
            <div className={styles.logBox}>
              {logs.map((log, i) => (
                <div key={i} className={styles.logItem}>
                  <span className={styles.logTurn}>[{turn - i > 0 ? turn - i : 1}]</span>
                  {log}
                </div>
              ))}
            </div>

            {/* Action Button */}
            <button 
              onClick={handleNextTurn}
              disabled={gameOver || victory}
              className={`
                ${styles.mainBtn} 
                ${gameOver ? styles.btnOver : victory ? styles.btnVictory : styles.btnDefault}
              `}
            >
              {gameOver ? "КІНЕЦЬ ГРИ" : victory ? "ПЕРЕМОГА!" : "ЗАВЕРШИТИ ХІД 🌙"}
            </button>
            
            {(gameOver || victory) && (
               <button onClick={() => window.location.reload()} className={styles.restartBtn}>
                 Почати спочатку
               </button>
            )}

            {/* Wonder */}
            {!victory && !gameOver && (
              <div className={styles.wonderCard}>
                 <div style={{display:'flex', justifyContent:'center', color:'#9333ea', marginBottom: '8px'}}>
                    <Castle size={24}/>
                 </div>
                 <h4 className={styles.wonderTitle}>Мета: Великий Замок</h4>
                 <div className={styles.wonderStats}>
                    <p className={resources.gold >= 1000 ? styles.successText : ""}>Золото: {Math.floor(resources.gold)}/1000</p>
                    <p className={resources.food >= 1000 ? styles.successText : ""}>Їжа: {Math.floor(resources.food)}/1000</p>
                    <p className={resources.population >= 50 ? styles.successText : ""}>Люди: {resources.population}/50</p>
                 </div>
                 <button 
                   onClick={buildWonder}
                   disabled={resources.gold < 1000 || resources.food < 1000 || resources.population < 50}
                   className={styles.wonderBtn}
                 >
                   Побудувати!
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;