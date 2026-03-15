using System;
using Microsoft.AspNetCore.Identity;

namespace API.Model;

public class AppUser:IdentityUser
{
    public string ? FullName{get;set;}
    public string ? ProfileImage{get;set;}

}
