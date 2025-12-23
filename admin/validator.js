class LotteryValidator {
    constructor() {
        this.contestResults = {};
    }

    setResults(results) {
        this.contestResults = {};
        results.forEach(r => {
            const key = `${r.contest}_${r.drawDate}`;
            this.contestResults[key] = {
                contest: r.contest,
                drawDate: r.drawDate,
                winningNumbers: r.winningNumbers,
                savedAt: new Date().toISOString()
            };
        });
    }

    getContestResult(contest, drawDate) {
        const key = `${contest}_${drawDate}`;
        return this.contestResults[key];
    }

    getAllResults() {
        return Object.values(this.contestResults);
    }

    matchNumbers(chosenNumbers, winningNumbers) {
        let matches = 0;
        const matchedNumbers = [];
        
        chosenNumbers.forEach(num => {
            if (winningNumbers.includes(num)) {
                matches++;
                matchedNumbers.push(num);
            }
        });
        
        return {
            count: matches,
            matchedNumbers: matchedNumbers
        };
    }

    getPrizeTier(matchCount) {
        switch(matchCount) {
            case 5:
                return { 
                    tier: 'GRAND PRIZE', 
                    color: 'gold', 
                    priority: 1,
                    badge: 'badge-gold'
                };
            case 4:
                return { 
                    tier: '2nd PRIZE', 
                    color: 'silver', 
                    priority: 2,
                    badge: 'badge-silver'
                };
            case 3:
                return { 
                    tier: '3rd PRIZE', 
                    color:  '#CD7F32', 
                    priority: 3,
                    badge: 'badge-bronze'
                };
            case 2:
                return { 
                    tier: 'CONSOLATION', 
                    color: 'green', 
                    priority: 4,
                    badge: 'badge-green'
                };
            default:
                return { 
                    tier: 'NO PRIZE', 
                    color: 'gray', 
                    priority: 5,
                    badge: ''
                };
        }
    }

    validateEntry(entry) {
        const result = this.getContestResult(entry.contest, entry.drawDate);
        
        if (!result) {
            return {
                validated: false,
                message: 'No winning numbers set for this contest'
            };
        }

        const matchResult = this.matchNumbers(entry.chosenNumbers, result.winningNumbers);
        const prizeTier = this.getPrizeTier(matchResult.count);

        return {
            validated: true,
            matches: matchResult.count,
            matchedNumbers: matchResult.matchedNumbers,
            prizeTier: prizeTier,
            winningNumbers: result.winningNumbers
        };
    }

    getWinningLevel(entries) {
        let highest = 0;
        entries.forEach(e => {
            if (e.validation && e.validation.validated) {
                highest = Math.max(highest, e.validation.matches);
            }
        });
        return highest;
    }

    getWinners(entries) {
        // Group by contest + drawDate
        const grouped = {};
        entries.forEach(entry => {
            const key = `${entry.contest}_${entry.drawDate}`;
            if (!grouped[key]) grouped[key] = [];
            const validation = this.validateEntry(entry);
            grouped[key].push({ ...entry, validation });
        });

        const winners = [];

        Object.values(grouped).forEach(group => {
            const winningLevel = this.getWinningLevel(group);
            if (winningLevel === 0) return;

            const levelWinners = group.filter(e => e.validation.validated && e.validation.matches === winningLevel);
            const prizePerWinner = levelWinners.length > 0 ? 1000 / levelWinners.length : 0;

            levelWinners.forEach(w => {
                winners.push({
                    ...w,
                    prize: prizePerWinner,
                    winningLevel
                });
            });
        });

        return winners.sort((a, b) => {
            if (a.contest === b.contest) {
                return b.validation.matches - a.validation.matches;
            }
            return a.contest > b.contest ? 1 : -1;
        });
    }

    getWinnersByContest(entries, contest) {
        const contestEntries = entries.filter(e => e.contest === contest);
        return this.getWinners(contestEntries);
    }

    getWinnersReport(entries) {
        const winners = this.getWinners(entries);
        return {
            grandPrize: winners.filter(w => w.validation.matches === 5),
            secondPrize: winners.filter(w => w.validation.matches === 4),
            thirdPrize: winners.filter(w => w.validation.matches === 3),
            consolation: winners.filter(w => w.validation.matches === 2),
            totalWinners: winners.length
        };
    }
}

// Global instance
const validator = new LotteryValidator();