namespace VirtuPathAPI.Models
{
    public class CareerPath
    {
        public int CareerPathID { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int Day { get; set; }  // Add this line
        public decimal Price { get; set; }
    }
}
