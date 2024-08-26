const quotes = [
  {
    day: 1,
    quote:
      'The goal of a successful trader is to make the best trades. Money is secondary.',
    author: 'Alexander Elder',
  },
  {
    day: 2,
    quote:
      "The four most dangerous words in investing are: 'This time it's different.'",
    author: 'Sir John Templeton',
  },
  {
    day: 3,
    quote:
      'It’s not whether you’re right or wrong that’s important, but how much money you make when you’re right and how much you lose when you’re wrong.',
    author: 'George Soros',
  },
  {
    day: 4,
    quote: 'The trend is your friend until the end when it bends.',
    author: 'Ed Seykota',
  },
  {
    day: 5,
    quote: 'An investment in knowledge pays the best interest.',
    author: 'Benjamin Franklin',
  },
  {
    day: 6,
    quote:
      'Letting losses run is the most serious mistake made by most investors.',
    author: "William O'Neil",
  },
  {
    day: 7,
    quote:
      'The market is a device for transferring money from the impatient to the patient.',
    author: 'Warren Buffett',
  },
  {
    day: 8,
    quote:
      'The goal of a successful trader is to make the best trades. Money is secondary.',
    author: 'Alexander Elder',
  },
  {
    day: 9,
    quote:
      'To be a good trader, you need to have three things: knowledge, patience, and discipline.',
    author: 'Mario Andretti',
  },
  {
    day: 10,
    quote:
      'Opportunities come infrequently. When it rains gold, put out the bucket, not the thimble.',
    author: 'Warren Buffett',
  },
  {
    day: 11,
    quote:
      "It's not the daily increase but daily decrease. Hack away at the unessential.",
    author: 'Bruce Lee',
  },
  {
    day: 12,
    quote: 'In investing, what is comfortable is rarely profitable.',
    author: 'Robert Arnott',
  },
  {
    day: 13,
    quote:
      'The stock market is filled with individuals who know the price of everything, but the value of nothing.',
    author: 'Philip Fisher',
  },
  {
    day: 14,
    quote:
      'The stock market is a device for transferring money from the impatient to the patient.',
    author: 'Warren Buffett',
  },
  {
    day: 15,
    quote:
      'Do not be embarrassed by your failures, learn from them and start again.',
    author: 'Richard Branson',
  },
  {
    day: 16,
    quote: "Risk comes from not knowing what you're doing.",
    author: 'Warren Buffett',
  },
  {
    day: 17,
    quote:
      'The market is a pendulum that forever swings between unsustainable optimism and unjustified pessimism.',
    author: 'Benjamin Graham',
  },
  {
    day: 18,
    quote:
      "In trading, it's not whether you're right or wrong that's important, but how much you make when you're right and how much you lose when you're wrong.",
    author: 'George Soros',
  },
  {
    day: 19,
    quote:
      'Investing should be more like watching paint dry or watching grass grow. If you want excitement, take $800 and go to Las Vegas.',
    author: 'Paul Samuelson',
  },
  {
    day: 20,
    quote:
      'The key to trading success is emotional discipline. If intelligence were the key, there would be a lot more people making money trading.',
    author: 'Victor Sperandeo',
  },
  {
    day: 21,
    quote:
      'Trading doesn’t just reveal your character, it also builds it if you stay in the game long enough.',
    author: 'Yvan Byeajee',
  },
  {
    day: 22,
    quote:
      'The hard work in trading comes in the preparation. The actual process of trading, however, should be effortless.',
    author: 'Jack Schwager',
  },
  {
    day: 23,
    quote:
      'Trading is a waiting game. You wait for the right moment to enter, and then you wait to exit.',
    author: 'Sam Seiden',
  },
  {
    day: 24,
    quote:
      'The elements of good trading are: (1) cutting losses, (2) cutting losses, and (3) cutting losses. If you can follow these three rules, you may have a chance.',
    author: 'Ed Seykota',
  },
  {
    day: 25,
    quote:
      'Amateurs focus on how much money they can make. Professionals focus on how much they could lose.',
    author: 'Jack Schwager',
  },
  {
    day: 26,
    quote: 'In trading, you learn much more from your losses than your wins.',
    author: 'Paul Tudor Jones',
  },
  {
    day: 27,
    quote:
      'The goal of a successful trader is to make the best trades. Money is secondary.',
    author: 'Alexander Elder',
  },
  {
    day: 28,
    quote:
      'Learn to take losses. The most important thing in making money is not letting your losses get out of hand.',
    author: 'Marty Schwartz',
  },
  {
    day: 29,
    quote:
      'The most important thing to do if you find yourself in a hole is to stop digging.',
    author: 'Warren Buffett',
  },
  {
    day: 30,
    quote:
      'The markets can remain irrational longer than you can remain solvent.',
    author: 'John Maynard Keynes',
  },
  {
    day: 31,
    quote: 'There is a huge difference between a good trade and good trading.',
    author: 'Steve Burns',
  },
  {
    day: 32,
    quote:
      'A good trader has to be very patient and very alert to see the opportunity. He must watch it come and then go by.',
    author: 'Bill Lipschutz',
  },
  {
    day: 33,
    quote:
      'Markets are constantly in a state of uncertainty and flux and money is made by discounting the obvious and betting on the unexpected.',
    author: 'George Soros',
  },
  {
    day: 34,
    quote: 'Trading is a mental game, and winning means keeping a clear mind.',
    author: 'Alexander Elder',
  },
  {
    day: 35,
    quote: 'Trade what you see, not what you think.',
    author: 'Linda Raschke',
  },
  {
    day: 36,
    quote:
      'The stock market is never obvious. It is designed to fool most of the people, most of the time.',
    author: 'Jesse Livermore',
  },
  {
    day: 37,
    quote:
      'The goal of a successful trader is to make the best trades. Money is secondary.',
    author: 'Alexander Elder',
  },
  {
    day: 38,
    quote: 'Do more of what works and less of what doesn’t.',
    author: 'Steve Clark',
  },
  {
    day: 39,
    quote:
      'In trading, like in life, the best traders are those who learn from their mistakes.',
    author: 'Tony Saliba',
  },
  {
    day: 40,
    quote:
      'The markets are unforgiving, and emotional trading is a recipe for disaster.',
    author: 'Victor Sperandeo',
  },
  {
    day: 41,
    quote: 'To be a great trader, you must think differently from the crowd.',
    author: 'Jack Schwager',
  },
  {
    day: 42,
    quote:
      "I learned that you don't need to be a genius to do well in trading. What you need is a solid plan and discipline.",
    author: 'Paul Tudor Jones',
  },
  {
    day: 43,
    quote:
      'The biggest risk is not taking any risk. In a world that’s changing really quickly, the only strategy that is guaranteed to fail is not taking risks.',
    author: 'Mark Zuckerberg',
  },
  {
    day: 44,
    quote:
      'Success in trading comes from risk management, not necessarily from being right.',
    author: 'Michael Marcus',
  },
  {
    day: 45,
    quote:
      'Your job as a trader is to make the best trades, money is secondary.',
    author: 'Alexander Elder',
  },
  {
    day: 46,
    quote:
      'The trick to trading is to always do the right thing at the right time.',
    author: 'Bill Lipschutz',
  },
  {
    day: 47,
    quote: 'I believe that having a trading strategy is essential to success.',
    author: 'Ray Dalio',
  },
  {
    day: 48,
    quote:
      'Don’t blindly follow someone, follow the market and try to hear what it is telling you.',
    author: 'Jaymin Shah',
  },
  {
    day: 49,
    quote:
      'To be a successful trader, you have to be able to see the future in advance.',
    author: 'Victor Niederhoffer',
  },
  {
    day: 50,
    quote:
      'What seems too high and risky to the majority generally goes higher, and what seems low and cheap generally goes lower.',
    author: "William O'Neil",
  },
  {
    day: 51,
    quote: 'In trading, the worst enemy is fear and greed.',
    author: 'Alexander Elder',
  },
  {
    day: 52,
    quote: 'The trend is your friend until the end when it bends.',
    author: 'Ed Seykota',
  },
  {
    day: 53,
    quote:
      'There are old traders, and there are bold traders, but there are very few old, bold traders.',
    author: 'Ed Seykota',
  },
  {
    day: 54,
    quote: 'You learn in this business, if you want a friend, get a dog.',
    author: 'Paul Tudor Jones',
  },
  {
    day: 55,
    quote:
      'To be a successful trader, you have to keep your emotions out of your decisions.',
    author: 'Alexander Elder',
  },
  {
    day: 56,
    quote: "In trading, it's the losers that keep you honest.",
    author: 'John D. Rockefeller',
  },
  {
    day: 57,
    quote:
      'The stock market is filled with individuals who know the price of everything, but the value of nothing.',
    author: 'Philip Fisher',
  },
  {
    day: 58,
    quote:
      'It is not the strongest of the species that survive, nor the most intelligent, but the one most responsive to change.',
    author: 'Charles Darwin',
  },
  {
    day: 59,
    quote: 'The less effort, the faster and more powerful you will be.',
    author: 'Bruce Lee',
  },
  {
    day: 60,
    quote:
      'If you want to have a better performance than the crowd, you must do things differently from the crowd.',
    author: 'John Templeton',
  },
  {
    day: 61,
    quote:
      'In trading, as in life, discipline is the bridge between goals and accomplishment.',
    author: 'Jim Rohn',
  },
  {
    day: 62,
    quote: 'I believe in analysis and not forecasting.',
    author: 'Nicolas Darvas',
  },
  {
    day: 63,
    quote: 'If you personalize losses, you can’t trade.',
    author: 'Bruce Kovner',
  },
  {
    day: 64,
    quote:
      'To be a great trader, you have to be confident in your decisions and patient in your process.',
    author: 'Michael Steinhardt',
  },
  {
    day: 65,
    quote:
      "You don't need to be a genius to trade well. You need a plan, discipline, and the ability to execute.",
    author: 'Steve Cohen',
  },
  {
    day: 66,
    quote:
      'In trading, the key is to not get carried away with emotions. Always stick to your plan.',
    author: 'David Tepper',
  },
  {
    day: 67,
    quote: 'Trade with a plan, not with your emotions.',
    author: 'John Carter',
  },
  {
    day: 68,
    quote: 'Trading is more psychology than strategy.',
    author: 'Tom Basso',
  },
  {
    day: 69,
    quote:
      "If you can learn to create a state of mind that is not affected by the market's behavior, the struggle will cease to exist.",
    author: 'Mark Douglas',
  },
  {
    day: 70,
    quote:
      'The trick is to never lose your capital. The trick to trading is to never blow up.',
    author: 'Paul Tudor Jones',
  },
  {
    day: 71,
    quote:
      'To succeed in trading, you must learn to follow the market, not the crowd.',
    author: 'Jack Schwager',
  },
  {
    day: 72,
    quote: 'In trading, as in life, you must learn from your mistakes.',
    author: 'Jesse Livermore',
  },
  {
    day: 73,
    quote:
      'The market is not random, it is the expression of a multitude of factors and emotions.',
    author: 'Richard Dennis',
  },
  {
    day: 74,
    quote:
      'To be a good trader, you need to have three things: knowledge, patience, and discipline.',
    author: 'Mario Andretti',
  },
  {
    day: 75,
    quote:
      'The market can remain irrational longer than you can remain solvent.',
    author: 'John Maynard Keynes',
  },
  {
    day: 76,
    quote: 'Trade only when the odds are in your favor.',
    author: 'Dennis Gartman',
  },
  {
    day: 77,
    quote:
      'To be successful in trading, you must have a plan and the discipline to stick to it.',
    author: 'Paul Tudor Jones',
  },
  {
    day: 78,
    quote: 'In trading, you must be willing to adapt to new information.',
    author: 'Ray Dalio',
  },
  {
    day: 79,
    quote:
      'To be a successful trader, you must be able to see the opportunities where others do not.',
    author: "William O'Neil",
  },
  {
    day: 80,
    quote:
      'Trading is like any other job: you have to work hard to get good at it.',
    author: 'Steve Clark',
  },
  {
    day: 81,
    quote:
      'The biggest mistake a trader can make is to hold onto losing positions.',
    author: 'John Paulson',
  },
  {
    day: 82,
    quote: 'In trading, you must be willing to take risks to make profits.',
    author: 'Carl Icahn',
  },
  {
    day: 83,
    quote:
      'The key to trading success is learning from your mistakes and not repeating them.',
    author: 'Michael Marcus',
  },
  {
    day: 84,
    quote:
      'The best traders have no ego. You have to swallow your pride and get out of the losses.',
    author: 'Tom Baldwin',
  },
  {
    day: 85,
    quote: 'A successful trader is a disciplined trader.',
    author: 'Mark Weinstein',
  },
  {
    day: 86,
    quote:
      'The key to trading success is emotional discipline. If intelligence were the key, there would be a lot more people making money trading.',
    author: 'Victor Sperandeo',
  },
  {
    day: 87,
    quote:
      'The goal of a successful trader is to make the best trades. Money is secondary.',
    author: 'Alexander Elder',
  },
  {
    day: 88,
    quote: 'To be a good trader, you must be patient and disciplined.',
    author: 'Paul Tudor Jones',
  },
  {
    day: 89,
    quote:
      'Trading is a waiting game. You wait for the right moment to enter, and then you wait to exit.',
    author: 'Sam Seiden',
  },
  {
    day: 90,
    quote:
      'Success in trading comes from risk management, not necessarily from being right.',
    author: 'Michael Marcus',
  },
];

export function getTradingQuoteOfTheDay(): { quote: string; author: string } {
  const totalQuotes = quotes.length;

  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = (dayOfYear - 1) % totalQuotes;

  return quotes[index];
}
