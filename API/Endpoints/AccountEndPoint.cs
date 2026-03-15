using System;
using API.Common;
using API.DTOs;
using API.Extensions;
using API.Model;
using API.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Endpoints;

public static class  AccountEndPoint
{
    public static async Task<RouteGroupBuilder> MapAccountEndPoint(this WebApplication app)
    {
        var group=app.MapGroup("/api/account").WithTags("account");

        group.MapPost("/register",async (HttpContext context,
        UserManager<AppUser> UserManager,[FromForm] string username, [FromForm] string fullName,[FromForm] string email,[FromForm] string password,[FromForm] IFormFile? ProfileImage
        ) => {
            var userFromdb=await UserManager.FindByEmailAsync(email);

            if(userFromdb is not null)
            {
                return Results.BadRequest(Response<string>.Failure("User is already Exist"));
            }

            if(ProfileImage is null)
            {
                return Results.BadRequest(Response<string>.Failure("Profile image is required"));
            }

            var picture=await FileUpload.Upload(ProfileImage);

            picture=$"{context.Request.Scheme}://{context.Request.Host}/uploads/{picture}";

            var user=new AppUser
            {
                Email=email,
                FullName=fullName,
                UserName=username,
                ProfileImage=picture
            };

            var result=await UserManager.CreateAsync(user,password);

            if (!result.Succeeded)
            {
                return Results.BadRequest(Response<string>.Failure(result.Errors.Select(x=>x.Description).FirstOrDefault()!));
            }
            return Results.Ok(Response<string>.Success("","User Cerated SuccessFully"));
        }).DisableAntiforgery();

        group.MapPost("/login",async (UserManager<AppUser> UserManager,
        TokenService tokenService,LoginDtos dto)=>
        {
            if(dto is null)
            {
                return Results.BadRequest(Response<string>.Failure("Invalid Login Credential"));    
            }

            var user=await UserManager.FindByEmailAsync(dto.Email);
            if(user is null)
            {
                return Results.BadRequest(Response<string>.Failure("User not Found"));
            }
            var result=await UserManager.CheckPasswordAsync(user!,dto.Password);
            if(!result)
            {
                return Results.BadRequest(Response<string>.Failure("Invalid Password"));
            }

            var token=tokenService.GenerateToken(user.Id,user.UserName);

            return Results.Ok(Response<string>.Success(token,"Login Successfully"));

        });
        
        group.MapGet("/me",async(HttpContext context, UserManager<AppUser> userManager) =>
        {
            var currentloggedInUserId=context.User.GetUserId();

            var currentLoggedinUser=await userManager.Users.SingleOrDefaultAsync(x=>x.Id==currentloggedInUserId.ToString());

            return Results.Ok(Response<AppUser>.Success(currentLoggedinUser!,"User fetched Successfully."));
        }).RequireAuthorization();
        return group;
    }
}
