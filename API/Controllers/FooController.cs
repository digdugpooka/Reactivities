using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [AllowAnonymous]
    public class FooController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
    }
}