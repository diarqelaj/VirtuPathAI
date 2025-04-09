using Microsoft.EntityFrameworkCore;

namespace VirtuPathAPI.Models
{
        public class DailyQuoteContext : DbContext
        {
            public DailyQuoteContext(DbContextOptions<DailyQuoteContext> options) : base(options) { }

            public DbSet<DailyQuote> DailyQuotes { get; set; }
        }
    }

