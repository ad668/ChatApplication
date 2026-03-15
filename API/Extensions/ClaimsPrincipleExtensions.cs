using System;
using System.Security.Claims;

namespace API.Extensions;

public static class ClaimsPrincipleExtensions
{
    public static string GetUserName(this ClaimsPrincipal user)
    {
        var username=user.FindFirstValue(ClaimTypes.Name)?? throw new Exception("Can not get username");
        return username;
    }

    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var userId=Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)?? throw new Exception("Can not get UserId"));
        return userId;
    }
}
